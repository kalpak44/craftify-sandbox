package com.craftify.notebooks.service;

import com.craftify.notebooks.document.NotebookCellDocument;
import com.craftify.notebooks.document.NotebookDocument;
import com.craftify.notebooks.dto.NotebookCellDto;
import com.craftify.notebooks.dto.NotebookDto;
import com.craftify.notebooks.repository.NotebookRepository;
import com.craftify.shared.dto.SearchFilter;
import com.craftify.shared.exception.ApiException;
import com.craftify.shared.service.CrudServiceAbstract;
import java.util.ArrayList;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class NotebooksService
    extends CrudServiceAbstract<NotebookDocument, NotebookDto, String, SearchFilter> {

  public NotebooksService(NotebookRepository repository) {
    super(repository);
  }

  @Override
  protected NotebookDto toDto(NotebookDocument notebookDocument) throws ApiException {
    if (notebookDocument.getName() == null || notebookDocument.getName().trim().isEmpty()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Notebook name must not be blank");
    }

    var dto = new NotebookDto();
    dto.setId(notebookDocument.getId());
    dto.setName(notebookDocument.getName());

    // Convert each NotebookCellDocument to NotebookCellDto
    if (notebookDocument.getCells() != null) {
      var cellDtos = new ArrayList<NotebookCellDto>();
      for (var cellDocument : notebookDocument.getCells()) {
        var cellDto = new NotebookCellDto();
        cellDto.setId(cellDocument.getId());
        cellDto.setType(cellDocument.getType());
        cellDto.setContent(cellDocument.getContent());
        cellDtos.add(cellDto);
      }
      dto.setCells(cellDtos);
    }

    return dto;
  }

  @Override
  protected NotebookDocument toEntity(NotebookDto dto) throws ApiException {
    if (dto.getName() == null || dto.getName().trim().isEmpty()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Notebook name must not be blank");
    }

    var notebookDocument = new NotebookDocument();
    notebookDocument.setId(dto.getId());
    notebookDocument.setName(dto.getName());

    // Convert each NotebookCellDto to NotebookCellDocument
    if (dto.getCells() != null) {
      var cellDocuments = new ArrayList<NotebookCellDocument>();
      for (NotebookCellDto cellDto : dto.getCells()) {
        var cellDocument = new NotebookCellDocument();
        cellDocument.setId(cellDto.getId());
        cellDocument.setType(cellDto.getType());
        cellDocument.setContent(cellDto.getContent());
        cellDocuments.add(cellDocument);
      }
      notebookDocument.setCells(cellDocuments);
    }

    return notebookDocument;
  }
}
