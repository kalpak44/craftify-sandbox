package com.craftify.service;

import com.craftify.dto.FileTreeNodeDto;
import com.craftify.dto.FileType;
import io.minio.ListObjectsArgs;
import io.minio.MinioClient;
import io.minio.Result;
import io.minio.messages.Item;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Utility to construct a hierarchical file tree with function recognition (via `.meta.json`) from MinIO storage.
 */
public class FunctionTreeBuilder {

    private final MinioClient minioClient;
    private final String bucketName;
    private final AuthentificationService authService;

    public FunctionTreeBuilder(MinioClient minioClient, String bucketName, AuthentificationService authService) {
        this.minioClient = minioClient;
        this.bucketName = bucketName;
        this.authService = authService;
    }

    /**
     * Builds a file tree rooted at the given folder path in the current user's namespace.
     *
     * @param treeRoot root folder to scan (relative or absolute)
     * @return FileTreeNodeDto root with nested children
     */
    public FileTreeNodeDto build(String treeRoot) {
        String userId = authService.getCurrentUserId();
        Path basePath = Paths.get(userId);
        if (treeRoot != null && !treeRoot.isBlank() && !treeRoot.equals("/")) {
            basePath = basePath.resolve(treeRoot);
        }

        String prefix = basePath.toString().replace("\\", "/");
        if (!prefix.endsWith("/")) prefix += "/";

        try {
            Iterable<Result<Item>> results = minioClient.listObjects(
                    ListObjectsArgs.builder()
                            .bucket(bucketName)
                            .prefix(prefix)
                            .recursive(true)
                            .build()
            );

            Map<String, FileTreeNodeDto> nodeMap = new HashMap<>();

            for (Result<Item> result : results) {
                Item item = result.get();
                String objectName = item.objectName();
                if (!objectName.startsWith(prefix)) continue;

                String relativePath = objectName.substring(prefix.length());
                if (relativePath.isBlank()) continue;

                Path path = Paths.get(relativePath);
                String name = path.getFileName().toString();

                boolean isMeta = name.equals(".meta.json");
                if (isMeta && path.getNameCount() > 1) {
                    String functionFolder = path.getParent().toString().replace("\\", "/");
                    FileTreeNodeDto folderNode = nodeMap.get(functionFolder);
                    if (folderNode != null) {
                        nodeMap.put(functionFolder, new FileTreeNodeDto(
                                folderNode.name(),
                                folderNode.fullPath(),
                                FileType.FUNCTION,
                                folderNode.size(),
                                folderNode.lastModified(),
                                folderNode.children()
                        ));
                    }
                    continue;
                }

                String fullRelativePath = path.toString().replace("\\", "/");
                FileType type = item.isDir() ? FileType.FOLDER : FileType.FILE;
                long size = item.size();
                Instant lastModified = item.lastModified() != null ? item.lastModified().toInstant() : null;

                FileTreeNodeDto node = new FileTreeNodeDto(
                        name,
                        fullRelativePath,
                        type,
                        size,
                        lastModified,
                        new ArrayList<>()
                );

                nodeMap.put(fullRelativePath, node);

                if (path.getNameCount() > 1) {
                    String parentPath = path.getParent().toString().replace("\\", "/");
                    FileTreeNodeDto parent = nodeMap.computeIfAbsent(parentPath, p ->
                            new FileTreeNodeDto(
                                    path.getParent().getFileName().toString(),
                                    parentPath,
                                    FileType.FOLDER,
                                    0L,
                                    null,
                                    new ArrayList<>()
                            )
                    );
                    parent.children().add(node);
                }
            }

            String rootKey = prefix.substring(userId.length() + 1);
            if (rootKey.endsWith("/")) rootKey = rootKey.substring(0, rootKey.length() - 1);

            FileTreeNodeDto rootNode = nodeMap.getOrDefault(rootKey,
                    new FileTreeNodeDto(
                            treeRoot != null ? Paths.get(treeRoot).getFileName().toString() : userId,
                            treeRoot,
                            FileType.FOLDER,
                            0L,
                            null,
                            new ArrayList<>()
                    )
            );

            List<FileTreeNodeDto> rootChildren = nodeMap.entrySet().stream()
                    .filter(entry -> Paths.get(entry.getKey()).getNameCount() == 1)
                    .map(Map.Entry::getValue)
                    .collect(Collectors.toList());

            return new FileTreeNodeDto(
                    rootNode.name(),
                    rootNode.fullPath(),
                    rootNode.type(),
                    rootNode.size(),
                    rootNode.lastModified(),
                    rootChildren
            );

        } catch (Exception e) {
            throw new RuntimeException("Failed to build file tree for root: " + treeRoot, e);
        }
    }
}
