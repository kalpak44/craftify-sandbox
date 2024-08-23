package com.craftify.notebooks.repository;

import com.craftify.notebooks.document.NotebookDocument;
import com.craftify.shared.repository.UserDataRepository;

public interface NotebookRepository extends UserDataRepository<NotebookDocument, String> {}
