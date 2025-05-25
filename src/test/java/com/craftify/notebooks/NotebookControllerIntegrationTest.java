package com.craftify.notebooks;

import com.craftify.auth.AuthUtil;
import com.craftify.common.exception.ResourceNotFoundException;
import com.craftify.common.exception.UnauthorizedException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Date;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class NotebookControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private NotebookService notebookService;

    @MockBean
    private AuthUtil authUtil;

    private final String TEST_USER_ID = "test-user-123";
    private final String NOTEBOOK_ID = "nb-test-id-456";

    @BeforeEach
    void setUp() {
        when(authUtil.getCurrentUserId()).thenReturn(TEST_USER_ID);
    }

    private Notebook createSampleNotebook() {
        Notebook notebook = new Notebook();
        notebook.setId(NOTEBOOK_ID);
        notebook.setUserId(TEST_USER_ID);
        notebook.setName("Test Notebook");
        notebook.setContent("{\"cells\":[]}");
        notebook.setCreatedAt(new Date());
        notebook.setLastModifiedDate(new Date());
        return notebook;
    }

    // --- CRUD Endpoint Tests (Brief) ---

    @Test
    void createNotebook_Success() throws Exception {
        Notebook notebookToCreate = new Notebook();
        notebookToCreate.setName("New Notebook");
        notebookToCreate.setContent("{}");

        Notebook savedNotebook = createSampleNotebook(); // Simulate what service returns
        savedNotebook.setName(notebookToCreate.getName());
        savedNotebook.setContent(notebookToCreate.getContent());

        when(notebookService.createNotebook(any(Notebook.class), eq(TEST_USER_ID))).thenReturn(savedNotebook);

        mockMvc.perform(post("/api/notebooks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(notebookToCreate)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(NOTEBOOK_ID))
                .andExpect(jsonPath("$.name").value("New Notebook"))
                .andExpect(jsonPath("$.userId").value(TEST_USER_ID));
    }

    @Test
    void getNotebook_Success() throws Exception {
        Notebook sampleNotebook = createSampleNotebook();
        when(notebookService.getNotebook(eq(NOTEBOOK_ID), eq(TEST_USER_ID))).thenReturn(sampleNotebook);

        mockMvc.perform(get("/api/notebooks/{id}", NOTEBOOK_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(NOTEBOOK_ID))
                .andExpect(jsonPath("$.name").value(sampleNotebook.getName()))
                .andExpect(jsonPath("$.userId").value(TEST_USER_ID));
    }

    @Test
    void getNotebook_NotFound() throws Exception {
        when(notebookService.getNotebook(eq(NOTEBOOK_ID), eq(TEST_USER_ID)))
                .thenThrow(new ResourceNotFoundException("Notebook with id " + NOTEBOOK_ID + " not found."));

        mockMvc.perform(get("/api/notebooks/{id}", NOTEBOOK_ID))
                .andExpect(status().isNotFound());
    }

    @Test
    void getNotebook_Unauthorized() throws Exception {
        when(notebookService.getNotebook(eq(NOTEBOOK_ID), eq(TEST_USER_ID)))
                .thenThrow(new UnauthorizedException("User not authorized for notebook " + NOTEBOOK_ID));

        mockMvc.perform(get("/api/notebooks/{id}", NOTEBOOK_ID))
                .andExpect(status().isUnauthorized());
    }


    // --- /run Endpoint Tests ---

    @Test
    void executeNotebookRun_Success() throws Exception {
        String mockExecutionResult = "{\"status\":\"completed\", \"output\":\"mock_output.ipynb\"}";
        when(notebookService.executeNotebook(eq(NOTEBOOK_ID), eq(TEST_USER_ID))).thenReturn(mockExecutionResult);

        mockMvc.perform(post("/api/notebooks/{id}/run", NOTEBOOK_ID))
                .andExpect(status().isOk())
                .andExpect(content().string(mockExecutionResult));
    }

    @Test
    void executeNotebookRun_ResourceNotFound() throws Exception {
        String errorMessage = "Notebook " + NOTEBOOK_ID + " not found for execution.";
        when(notebookService.executeNotebook(eq(NOTEBOOK_ID), eq(TEST_USER_ID)))
                .thenThrow(new ResourceNotFoundException(errorMessage));

        mockMvc.perform(post("/api/notebooks/{id}/run", NOTEBOOK_ID))
                .andExpect(status().isNotFound())
                .andExpect(content().string(errorMessage));
    }

    @Test
    void executeNotebookRun_Unauthorized() throws Exception {
        String errorMessage = "User " + TEST_USER_ID + " is not authorized to execute notebook " + NOTEBOOK_ID;
        when(notebookService.executeNotebook(eq(NOTEBOOK_ID), eq(TEST_USER_ID)))
                .thenThrow(new UnauthorizedException(errorMessage));

        mockMvc.perform(post("/api/notebooks/{id}/run", NOTEBOOK_ID))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string(errorMessage));
    }

    @Test
    void executeNotebookRun_ServiceRuntimeException() throws Exception {
        String errorMessage = "Kubernetes job submission failed due to cluster error.";
        when(notebookService.executeNotebook(eq(NOTEBOOK_ID), eq(TEST_USER_ID)))
                .thenThrow(new RuntimeException(errorMessage));

        mockMvc.perform(post("/api/notebooks/{id}/run", NOTEBOOK_ID))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Error executing notebook: " + errorMessage));
    }
}
