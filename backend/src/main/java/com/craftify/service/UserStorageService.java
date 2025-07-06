package com.craftify.service;

import com.craftify.config.MinioClientConfig;
import com.craftify.dto.FileItemDto;
import com.craftify.dto.FileType;
import io.minio.ListObjectsArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.Result;
import io.minio.messages.Item;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.file.Paths;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

/**
 * Service for interacting with MinIO object storage for authenticated users.
 * Provides operations such as listing and creating folders in the user namespace.
 */
@Service
public class UserStorageService {

    private final MinioClient minioClient;
    private final String bucketName;
    private final AuthentificationService authentificationService;

    public UserStorageService(MinioClient minioClient,
                              MinioClientConfig minioClientConfig,
                              AuthentificationService authentificationService) {
        this.minioClient = minioClient;
        this.bucketName = minioClientConfig.getBucket();
        this.authentificationService = authentificationService;
    }

    /**
     * Lists the files and folders under a given subfolder for the authenticated user.
     * If subFolder is null, empty or "/", it defaults to the user's root directory.
     */
    public List<FileItemDto> listUserFolder(String subFolder) {
        var userId = authentificationService.getCurrentUserId();
        var basePath = Paths.get(userId);

        if (subFolder != null && !subFolder.isBlank() && !subFolder.equals("/")) {
            basePath = basePath.resolve(subFolder);
        }

        var prefix = basePath.toString().replace("\\", "/") + "/";

        var results = minioClient.listObjects(
                ListObjectsArgs.builder()
                        .bucket(bucketName)
                        .prefix(prefix)
                        .delimiter("/")
                        .build()
        );

        return StreamSupport.stream(results.spliterator(), false)
                .map(result -> toDto(result, prefix))
                .filter(Objects::nonNull)
                .filter(f -> FileType.FOLDER.equals(f.type()) || (FileType.FILE.equals(f.type()) && f.size() > 0))
                .collect(Collectors.toList());
    }

    /**
     * Creates a new folder for the current user inside the specified path.
     * Relative and absolute paths are resolved within the user's namespace.
     */
    public void createUserFolder(String folderPath) {
        var userId = authentificationService.getCurrentUserId();
        var userRoot = Paths.get(userId);
        var fullPath = Paths.get(folderPath).isAbsolute()
                ? userRoot.resolve(folderPath.substring(1))
                : userRoot.resolve(folderPath);

        var objectName = fullPath.toString().replace("\\", "/");
        if (!objectName.endsWith("/")) {
            objectName += "/";
        }

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
     * Converts a MinIO {@link Item} to a {@link FileItemDto}, removing the user-specific prefix.
     */
    private FileItemDto toDto(Result<Item> result, String prefix) {
        try {
            var item = result.get();
            var fullPath = item.objectName();

            if (!fullPath.startsWith(prefix)) {
                return null;
            }

            var relativeName = fullPath.substring(prefix.length());
            var type = item.isDir() ? FileType.FOLDER : FileType.FILE;
            var size = item.size();
            var lastModified = item.lastModified() != null
                    ? item.lastModified().toInstant()
                    : null;

            var userId = authentificationService.getCurrentUserId();
            var userPrefix = userId + "/";
            var fullPathWithoutUser = fullPath.startsWith(userPrefix)
                    ? fullPath.substring(userPrefix.length())
                    : fullPath;

            return new FileItemDto(relativeName, type, size, lastModified, fullPathWithoutUser);
        } catch (Exception e) {
            throw new RuntimeException("Failed to map item to FileItemDto", e);
        }
    }

    /**
     * Uploads a file to the specified folder within the authenticated user's namespace.
     *
     * @param folderPath the relative or absolute path where the file should be uploaded.
     *                   If null or blank, the file will be uploaded to the user's root directory.
     * @param file       the file to upload, received from the client via multipart/form-data.
     * @throws IllegalArgumentException if the file's original filename is null.
     * @throws RuntimeException         if an error occurs during upload to MinIO.
     */
    public void uploadUserFile(String folderPath, MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new IllegalArgumentException("Uploaded file must have a valid name.");
        }

        var userId = authentificationService.getCurrentUserId();
        var userRoot = Paths.get(userId);
        var fullPath = (folderPath == null || folderPath.isBlank())
                ? userRoot
                : Paths.get(folderPath).isAbsolute()
                ? userRoot.resolve(folderPath.substring(1))
                : userRoot.resolve(folderPath);

        var objectName = fullPath.resolve(originalFilename).toString().replace("\\", "/");

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
}
