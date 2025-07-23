package com.craftify.bff.service;

import com.craftify.bff.config.MinioClientConfig;
import com.craftify.bff.dto.FileItemDto;
import com.craftify.bff.dto.FileType;
import io.minio.GetObjectArgs;
import io.minio.ListObjectsArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.Result;
import io.minio.messages.Item;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

/**
 * Service for authenticated user interaction with object storage via MinIO.
 * Supports folder and file operations including list, upload, delete, move.
 */
@Service
public class UserStorageService {

    private final MinioClient minioClient;
    private final String bucketName;
    private final AuthentificationService authentificationService;

    public UserStorageService(MinioClient minioClient, MinioClientConfig config, AuthentificationService authService) {
        this.minioClient = minioClient;
        this.bucketName = config.getBucket();
        this.authentificationService = authService;
    }

    /**
     * Lists the contents of the user's folder.
     *
     * @param subFolder Subfolder path relative to the user root. If null or blank, root is assumed.
     * @return List of file and folder DTOs.
     */
    public List<FileItemDto> listUserFolder(String subFolder) {
        String prefix = buildUserPrefix(subFolder, true);
        Iterable<Result<Item>> results = minioClient.listObjects(
                ListObjectsArgs.builder().bucket(bucketName).prefix(prefix).delimiter("/").build()
        );

        return StreamSupport.stream(results.spliterator(), false)
                .map(result -> toFileItemDto(result, prefix))
                .filter(Objects::nonNull)
                .filter(dto -> dto.type() == FileType.FOLDER || (dto.type() == FileType.FILE && dto.size() > 0))
                .collect(Collectors.toList());
    }

    /**
     * Creates a new folder under the user's namespace.
     *
     * @param folderPath Relative or absolute folder path.
     */
    public void createUserFolder(String folderPath) {
        String objectName = normalizePath(resolveUserPath(folderPath).toString()) + "/";
        try {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(InputStream.nullInputStream(), 0, -1)
                            .contentType("application/x-directory")
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to create folder: " + folderPath, e);
        }
    }

    /**
     * Uploads a file to a specified folder within the user namespace.
     *
     * @param folderPath Folder path relative to the user's namespace.
     * @param file       Multipart file to upload.
     */
    public void uploadUserFile(String folderPath, MultipartFile file) {
        String originalFilename = Objects.requireNonNull(file.getOriginalFilename(), "Uploaded file must have a valid name.");
        Path fullPath = resolveUserPath(folderPath).resolve(originalFilename);
        String objectName = normalizePath(fullPath.toString());

        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file: " + originalFilename, e);
        }
    }

    /**
     * Downloads a file from the user's namespace.
     *
     * @param fullPath Full or relative file path.
     * @return InputStream of file content.
     */
    public InputStream downloadUserFile(String fullPath) {
        String objectName = normalizePath(resolveUserPath(fullPath).toString());

        try {
            return minioClient.getObject(
                    GetObjectArgs.builder().bucket(bucketName).object(objectName).build()
            );
        } catch (Exception e) {
            throw new RuntimeException("File not found or could not be downloaded: " + fullPath, e);
        }
    }

    /**
     * Deletes a file or folder (recursively) from the user namespace.
     *
     * @param fullPath Relative or absolute path of the file/folder to delete.
     */
    public void deleteUserPath(String fullPath) {
        String objectPrefix = normalizePath(resolveUserPath(fullPath).toString());
        boolean isFolder = objectPrefix.endsWith("/") || fullPath.endsWith("/");

        if (isFolder && !objectPrefix.endsWith("/")) {
            objectPrefix += "/";
        }

        try {
            Iterable<Result<Item>> results = minioClient.listObjects(
                    ListObjectsArgs.builder().bucket(bucketName).prefix(objectPrefix).recursive(true).build()
            );

            List<String> objectsToDelete = StreamSupport.stream(results.spliterator(), false)
                    .map(result -> getItemNameOrThrow(result, "Failed to resolve object for deletion"))
                    .toList();

            for (String object : objectsToDelete) {
                minioClient.removeObject(RemoveObjectArgs.builder().bucket(bucketName).object(object).build());
            }

            if (!isFolder && objectsToDelete.isEmpty()) {
                minioClient.removeObject(RemoveObjectArgs.builder().bucket(bucketName).object(objectPrefix).build());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete path: " + fullPath, e);
        }
    }

    /**
     * Moves or renames a file within the user namespace.
     *
     * @param fromPath Original file path.
     * @param toPath   Target file path.
     */
    public void moveUserPath(String fromPath, String toPath) {
        String fromObject = normalizePath(resolveUserPath(fromPath).toString());
        String toObject = normalizePath(resolveUserPath(toPath).toString());

        try (InputStream stream = minioClient.getObject(GetObjectArgs.builder().bucket(bucketName).object(fromObject).build())) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(toObject)
                            .stream(stream, -1, 10485760)
                            .contentType("application/octet-stream")
                            .build()
            );
            minioClient.removeObject(RemoveObjectArgs.builder().bucket(bucketName).object(fromObject).build());
        } catch (Exception e) {
            throw new RuntimeException("Failed to move from " + fromPath + " to " + toPath, e);
        }
    }


    private void writeFile(String objectPath, String content) throws Exception {
        byte[] bytes = content.getBytes(StandardCharsets.UTF_8);
        try (InputStream stream = new ByteArrayInputStream(bytes)) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectPath)
                            .stream(stream, bytes.length, -1)
                            .build()
            );
        }
    }


    /**
     * Stores a plain text file in the user's namespace.
     *
     * @param path    File path.
     * @param content Text content to write.
     */
    public void putTextFile(String path, String content) {
        String objectName = normalizePath(resolveUserPath(path).toString());
        try {
            writeFile(objectName, content);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create text file: " + path, e);
        }
    }


    private String buildUserPrefix(String path, boolean withTrailingSlash) {
        Path base = resolveUserPath(path);
        String prefix = normalizePath(base.toString());
        return withTrailingSlash && !prefix.endsWith("/") ? prefix + "/" : prefix;
    }

    private Path resolveUserPath(String inputPath) {
        String userId = authentificationService.getCurrentUserId();
        Path root = Paths.get(userId);
        if (inputPath == null || inputPath.isBlank()) return root;
        return Paths.get(inputPath).isAbsolute()
                ? root.resolve(inputPath.substring(1))
                : root.resolve(inputPath);
    }

    private String normalizePath(String path) {
        return path.replace("\\", "/");
    }

    private String getItemNameOrThrow(Result<Item> result, String errorMsg) {
        try {
            return result.get().objectName();
        } catch (Exception e) {
            throw new RuntimeException(errorMsg, e);
        }
    }

    private FileItemDto toFileItemDto(Result<Item> result, String prefix) {
        try {
            Item item = result.get();
            String objectName = item.objectName();

            if (!objectName.startsWith(prefix)) return null;

            String relativeName = objectName.substring(prefix.length());
            String userId = authentificationService.getCurrentUserId();
            String relativeFullPath = objectName.substring((userId + "/").length());
            long size = item.size();
            Instant modified = item.lastModified() != null ? item.lastModified().toInstant() : null;

            FileType type = item.isDir() ? FileType.FOLDER : FileType.FILE;

            return new FileItemDto(relativeName, type, size, modified, relativeFullPath);

        } catch (Exception e) {
            throw new RuntimeException("Failed to convert item to FileItemDto", e);
        }
    }
}
