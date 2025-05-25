package com.craftify.notebooks;

import com.craftify.auth.AuthUtil;
import com.craftify.common.exception.ResourceNotFoundException;
import com.craftify.common.exception.UnauthorizedException;
import io.fabric8.kubernetes.api.model.ObjectMeta;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.PodList;
import io.fabric8.kubernetes.api.model.batch.v1.Job;
import io.fabric8.kubernetes.api.model.batch.v1.JobCondition;
import io.fabric8.kubernetes.api.model.batch.v1.JobStatus;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.dsl.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.io.IOException;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.nio.file.spi.FileSystemProvider;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.function.Predicate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotebookServiceTest {

    @Mock
    private NotebookRepository notebookRepository;

    @Mock
    private AuthUtil authUtil;

    @Mock(answer = Answers.RETURNS_DEEP_STUBS) // For fluent API
    private KubernetesClient kubernetesClient;

    @InjectMocks
    private NotebookService notebookService;

    private Notebook sampleNotebook;
    private final String userId = "user123";
    private final String notebookId = "nb123";

    @BeforeEach
    void setUp() {
        sampleNotebook = new Notebook();
        sampleNotebook.setId(notebookId);
        sampleNotebook.setUserId(userId);
        sampleNotebook.setName("Test Notebook");
        sampleNotebook.setContent("{\"cells\":[]}");
    }

    // --- getNotebookContent Tests ---
    @Test
    void getNotebookContent_Success() {
        when(notebookRepository.findById(notebookId)).thenReturn(Optional.of(sampleNotebook));
        String content = notebookService.getNotebookContent(notebookId, userId);
        assertEquals(sampleNotebook.getContent(), content);
        verify(notebookRepository).findById(notebookId);
    }

    @Test
    void getNotebookContent_NotFound() {
        when(notebookRepository.findById(notebookId)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> notebookService.getNotebookContent(notebookId, userId));
    }

    @Test
    void getNotebookContent_Unauthorized() {
        sampleNotebook.setUserId("otherUser");
        when(notebookRepository.findById(notebookId)).thenReturn(Optional.of(sampleNotebook));
        assertThrows(UnauthorizedException.class, () -> notebookService.getNotebookContent(notebookId, userId));
    }

    // --- CRUD Operation Tests ---
    @Test
    void createNotebook_Success() {
        Notebook newNotebook = new Notebook();
        newNotebook.setName("New NB");
        when(notebookRepository.save(any(Notebook.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Notebook created = notebookService.createNotebook(newNotebook, userId);

        assertNotNull(created);
        assertEquals(userId, created.getUserId());
        verify(notebookRepository).save(newNotebook);
    }

    @Test
    void getNotebooksForUser_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        List<Notebook> notebooks = Collections.singletonList(sampleNotebook);
        Page<Notebook> notebookPage = new PageImpl<>(notebooks, pageable, 1);
        when(notebookRepository.findByUserId(userId, pageable)).thenReturn(notebookPage);

        Page<Notebook> result = notebookService.getNotebooksForUser(userId, pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals(sampleNotebook, result.getContent().get(0));
        verify(notebookRepository).findByUserId(userId, pageable);
    }

    @Test
    void getNotebook_Success() {
        when(notebookRepository.findById(notebookId)).thenReturn(Optional.of(sampleNotebook));
        Notebook result = notebookService.getNotebook(notebookId, userId);
        assertEquals(sampleNotebook, result);
    }

    @Test
    void updateNotebook_Success() {
        Notebook updatedInfo = new Notebook();
        updatedInfo.setName("Updated Name");
        updatedInfo.setDescription("Updated Desc");
        updatedInfo.setContent("{}");
        updatedInfo.setTags(List.of("newtag"));

        when(notebookRepository.findById(notebookId)).thenReturn(Optional.of(sampleNotebook));
        when(notebookRepository.save(any(Notebook.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Notebook updated = notebookService.updateNotebook(notebookId, updatedInfo, userId);

        assertEquals("Updated Name", updated.getName());
        assertEquals("Updated Desc", updated.getDescription());
        assertEquals("{}", updated.getContent());
        assertEquals(List.of("newtag"), updated.getTags());
        verify(notebookRepository).save(sampleNotebook);
    }
     @Test
    void updateNotebook_NotFound() {
        Notebook updatedInfo = new Notebook();
        updatedInfo.setName("Updated Name");
        when(notebookRepository.findById(notebookId)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> notebookService.updateNotebook(notebookId, updatedInfo, userId));
    }


    @Test
    void deleteNotebook_Success() {
        when(notebookRepository.findById(notebookId)).thenReturn(Optional.of(sampleNotebook));
        doNothing().when(notebookRepository).delete(sampleNotebook);
        notebookService.deleteNotebook(notebookId, userId);
        verify(notebookRepository).delete(sampleNotebook);
    }

    // --- executeNotebook Tests ---

    // Helper for mocking Kubernetes client chain for job creation and monitoring
    @SuppressWarnings("unchecked") // For raw type casting
    private void mockKubernetesJobSuccess(String jobName, String podName) {
        // Mock Job creation
        NonNamespaceOperation<Job, JobList, Resource<Job>> jobResource = mock(NonNamespaceOperation.class);
        when(kubernetesClient.batch().v1().jobs().inNamespace(anyString())).thenReturn(jobResource);
        when(jobResource.createOrReplace(any(Job.class))).thenReturn(mock(Job.class));


        // Mock Job waiting and status
        MixedOperation<Job, JobList, Resource<Job>> jobOperations = mock(MixedOperation.class);
        when(kubernetesClient.batch().v1().jobs()).thenReturn(jobOperations);
        when(jobOperations.inNamespace(anyString())).thenReturn(jobResource);

        Resource<Job> namedJobResource = mock(Resource.class);
        when(jobResource.withName(jobName)).thenReturn(namedJobResource);

        // Simulate successful completion for waitUntilCondition
        // This is tricky, direct mocking of waitUntilCondition is hard.
        // We ensure the condition it checks passes.
        Job completedJob = mock(Job.class);
        JobStatus jobStatus = mock(JobStatus.class);
        when(completedJob.getStatus()).thenReturn(jobStatus);
        when(jobStatus.getSucceeded()).thenReturn(1); // Mark as succeeded
        when(namedJobResource.get()).thenReturn(completedJob); // Return this when get() is called after "wait"
        
        // For waitUntilCondition itself, if it's a final method or complex,
        // we can mock the get() that it uses internally or assume it passes if status is Succeeded.
        // For this example, we'll rely on the get() call after the wait.
        // Or, more directly:
        when(namedJobResource.waitUntilCondition(any(Predicate.class), anyLong(), any(TimeUnit.class)))
              .thenAnswer(invocation -> {
                  // Simulate the job becoming "complete" for the predicate
                  when(namedJobResource.get()).thenReturn(completedJob);
                  return completedJob; // Return the completed job
              });


        // Mock Pod listing and log retrieval
        PodList podList = mock(PodList.class);
        Pod pod = mock(Pod.class);
        ObjectMeta podMeta = mock(ObjectMeta.class);
        when(pod.getMetadata()).thenReturn(podMeta);
        when(podMeta.getName()).thenReturn(podName);
        when(podList.getItems()).thenReturn(Collections.singletonList(pod));

        MixedOperation<Pod, PodList, Resource<Pod>> podOperations = mock(MixedOperation.class);
        when(kubernetesClient.pods()).thenReturn(podOperations);
        when(podOperations.inNamespace(anyString())).thenReturn(mock(NonNamespaceOperation.class));
        when(kubernetesClient.pods().inNamespace(anyString()).withLabel("job-name", jobName)).thenReturn(mock(FilterWatchListDeletable.class));
        when(kubernetesClient.pods().inNamespace(anyString()).withLabel("job-name", jobName).list()).thenReturn(podList);
        
        PodResource<Pod> podResource = mock(PodResource.class);
        when(kubernetesClient.pods().inNamespace(anyString()).withName(podName)).thenReturn(podResource);
        when(podResource.getLog()).thenReturn("Mocked Kubernetes job logs");
    }


    @Test
    void executeNotebook_Success_ReturnsOutputContent() throws IOException {
        when(notebookRepository.findById(notebookId)).thenReturn(Optional.of(sampleNotebook)); // For getNotebookContent

        Path mockTempDir = mock(Path.class);
        Path mockInputFile = mock(Path.class);
        Path mockOutputFile = mock(Path.class);
        
        String expectedOutputContent = "{\"cells\":[\"output_cell\"]}";

        try (MockedStatic<Files> mockedFiles = Mockito.mockStatic(Files.class);
             MockedStatic<UUID> mockedUuid = Mockito.mockStatic(UUID.class)) {
            
            UUID fixedUuid = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
            mockedUuid.when(UUID::randomUUID).thenReturn(fixedUuid);
            String jobName = "notebook-job-" + fixedUuid;
            String podName = "notebook-job-" + fixedUuid + "-pod";


            mockedFiles.when(() -> Files.createTempDirectory(startsWith("notebook-execution-"))).thenReturn(mockTempDir);
            when(mockTempDir.resolve("input.ipynb")).thenReturn(mockInputFile);
            when(mockTempDir.resolve("output.ipynb")).thenReturn(mockOutputFile);
            mockedFiles.when(() -> Files.writeString(eq(mockInputFile), anyString(), any(StandardOpenOption.class))).thenReturn(mockInputFile);
            
            mockedFiles.when(() -> Files.exists(mockOutputFile)).thenReturn(true);
            mockedFiles.when(() -> Files.readString(mockOutputFile)).thenReturn(expectedOutputContent);
            
            // Mock the recursive deletion
            mockedFiles.when(() -> Files.walkFileTree(eq(mockTempDir), any())).thenReturn(mockTempDir);


            mockKubernetesJobSuccess(jobName, podName);

            String result = notebookService.executeNotebook(notebookId, userId);
            assertEquals(expectedOutputContent, result);

            mockedFiles.verify(() -> Files.createTempDirectory(startsWith("notebook-execution-")));
            mockedFiles.verify(() -> Files.writeString(eq(mockInputFile), eq(sampleNotebook.getContent()), any(StandardOpenOption.class)));
            mockedFiles.verify(() -> Files.readString(mockOutputFile));
            mockedFiles.verify(() -> Files.walkFileTree(eq(mockTempDir), any())); // Verify cleanup
        }
    }
    
    @Test
    void executeNotebook_Success_OutputNotFound_ReturnsLogs() throws IOException {
        when(notebookRepository.findById(notebookId)).thenReturn(Optional.of(sampleNotebook));

        Path mockTempDir = mock(Path.class);
        Path mockInputFile = mock(Path.class);
        Path mockOutputFile = mock(Path.class);
        
        try (MockedStatic<Files> mockedFiles = Mockito.mockStatic(Files.class);
             MockedStatic<UUID> mockedUuid = Mockito.mockStatic(UUID.class)) {
            
            UUID fixedUuid = UUID.fromString("123e4567-e89b-12d3-a456-426614174001"); // Different UUID
            mockedUuid.when(UUID::randomUUID).thenReturn(fixedUuid);
            String jobName = "notebook-job-" + fixedUuid;
            String podName = "notebook-job-" + fixedUuid + "-pod";

            mockedFiles.when(() -> Files.createTempDirectory(startsWith("notebook-execution-"))).thenReturn(mockTempDir);
            when(mockTempDir.resolve("input.ipynb")).thenReturn(mockInputFile);
            when(mockTempDir.resolve("output.ipynb")).thenReturn(mockOutputFile); // For the check
            mockedFiles.when(() -> Files.writeString(eq(mockInputFile), anyString(), any(StandardOpenOption.class))).thenReturn(mockInputFile);
            
            mockedFiles.when(() -> Files.exists(mockOutputFile)).thenReturn(false); // Output file does not exist
             mockedFiles.when(() -> Files.walkFileTree(eq(mockTempDir), any())).thenReturn(mockTempDir);


            mockKubernetesJobSuccess(jobName, podName); // Mocks K8s client to return "Mocked Kubernetes job logs"

            String result = notebookService.executeNotebook(notebookId, userId);
            assertTrue(result.contains("Job Succeeded. Output file not found. Logs:"));
            assertTrue(result.contains("Mocked Kubernetes job logs"));
        }
    }


    @Test
    void executeNotebook_JobFailed() throws IOException {
        when(notebookRepository.findById(notebookId)).thenReturn(Optional.of(sampleNotebook));

        Path mockTempDir = mock(Path.class);
        Path mockInputFile = mock(Path.class);

        try (MockedStatic<Files> mockedFiles = Mockito.mockStatic(Files.class);
             MockedStatic<UUID> mockedUuid = Mockito.mockStatic(UUID.class)) {

            UUID fixedUuid = UUID.fromString("123e4567-e89b-12d3-a456-426614174002");
            mockedUuid.when(UUID::randomUUID).thenReturn(fixedUuid);
            String jobName = "notebook-job-" + fixedUuid;

            mockedFiles.when(() -> Files.createTempDirectory(startsWith("notebook-execution-"))).thenReturn(mockTempDir);
            when(mockTempDir.resolve("input.ipynb")).thenReturn(mockInputFile);
            mockedFiles.when(() -> Files.writeString(eq(mockInputFile), anyString(), any(StandardOpenOption.class))).thenReturn(mockInputFile);
            mockedFiles.when(() -> Files.walkFileTree(eq(mockTempDir), any())).thenReturn(mockTempDir);


            // Mock K8s Job Failure
            NonNamespaceOperation<Job, JobList, Resource<Job>> jobResource = mock(NonNamespaceOperation.class);
            when(kubernetesClient.batch().v1().jobs().inNamespace(anyString())).thenReturn(jobResource);
            when(jobResource.createOrReplace(any(Job.class))).thenReturn(mock(Job.class));
            
            Resource<Job> namedJobResource = mock(Resource.class);
            when(jobResource.withName(jobName)).thenReturn(namedJobResource);

            Job failedJob = mock(Job.class);
            JobStatus jobStatus = mock(JobStatus.class);
            JobCondition jobCondition = mock(JobCondition.class);
            when(jobCondition.getMessage()).thenReturn("Job failed due to an error");
            when(jobStatus.getConditions()).thenReturn(Collections.singletonList(jobCondition));
            when(jobStatus.getSucceeded()).thenReturn(null); // Or 0
            when(jobStatus.getFailed()).thenReturn(1);    // Mark as failed
            when(failedJob.getStatus()).thenReturn(jobStatus);
            
            // Simulate failure for waitUntilCondition or the subsequent get()
             when(namedJobResource.waitUntilCondition(any(Predicate.class), anyLong(), any(TimeUnit.class)))
              .thenAnswer(invocation -> {
                  when(namedJobResource.get()).thenReturn(failedJob); // Job has "failed"
                  return failedJob; 
              });
            when(namedJobResource.get()).thenReturn(failedJob);


            // Mock Pod listing for logs (even if job failed, logs might be there)
            PodList podList = mock(PodList.class);
            when(kubernetesClient.pods().inNamespace(anyString()).withLabel("job-name", jobName).list()).thenReturn(podList);
            when(podList.getItems()).thenReturn(Collections.emptyList()); // No pods, or mock one with logs

            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> notebookService.executeNotebook(notebookId, userId));
            assertTrue(exception.getMessage().contains("Notebook execution failed"));
            assertTrue(exception.getMessage().contains("Job failed due to an error"));
        }
    }
    
    @Test
    void executeNotebook_GetContent_ResourceNotFound() {
        when(notebookRepository.findById(notebookId)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> notebookService.executeNotebook(notebookId, userId));
    }

    @Test
    void executeNotebook_IOException_OnWrite() throws IOException {
        when(notebookRepository.findById(notebookId)).thenReturn(Optional.of(sampleNotebook));
        Path mockTempDir = mock(Path.class);

        try (MockedStatic<Files> mockedFiles = Mockito.mockStatic(Files.class)) {
            mockedFiles.when(() -> Files.createTempDirectory(startsWith("notebook-execution-"))).thenReturn(mockTempDir);
            when(mockTempDir.resolve(anyString())).thenReturn(mock(Path.class)); // input.ipynb
            mockedFiles.when(() -> Files.writeString(any(Path.class), anyString(), any(StandardOpenOption.class)))
                       .thenThrow(new IOException("Disk full"));
            mockedFiles.when(() -> Files.walkFileTree(eq(mockTempDir), any())).thenReturn(mockTempDir);


            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> notebookService.executeNotebook(notebookId, userId));
            assertTrue(exception.getMessage().contains("Error during file operations"));
            assertTrue(exception.getCause() instanceof IOException);
        }
    }

    @Test
    void executeNotebook_InterruptedException() throws IOException, InterruptedException {
        when(notebookRepository.findById(notebookId)).thenReturn(Optional.of(sampleNotebook));
        Path mockTempDir = mock(Path.class);
        Path mockInputFile = mock(Path.class);

        try (MockedStatic<Files> mockedFiles = Mockito.mockStatic(Files.class);
             MockedStatic<UUID> mockedUuid = Mockito.mockStatic(UUID.class)) {
            
            UUID fixedUuid = UUID.fromString("123e4567-e89b-12d3-a456-426614174003");
            mockedUuid.when(UUID::randomUUID).thenReturn(fixedUuid);
            String jobName = "notebook-job-" + fixedUuid;

            mockedFiles.when(() -> Files.createTempDirectory(startsWith("notebook-execution-"))).thenReturn(mockTempDir);
            when(mockTempDir.resolve("input.ipynb")).thenReturn(mockInputFile);
            mockedFiles.when(() -> Files.writeString(eq(mockInputFile), anyString(), any(StandardOpenOption.class))).thenReturn(mockInputFile);
            mockedFiles.when(() -> Files.walkFileTree(eq(mockTempDir), any())).thenReturn(mockTempDir);


            NonNamespaceOperation<Job, JobList, Resource<Job>> jobResource = mock(NonNamespaceOperation.class);
            when(kubernetesClient.batch().v1().jobs().inNamespace(anyString())).thenReturn(jobResource);
            when(jobResource.createOrReplace(any(Job.class))).thenReturn(mock(Job.class));
            
            Resource<Job> namedJobResource = mock(Resource.class);
            when(jobResource.withName(jobName)).thenReturn(namedJobResource);
            when(namedJobResource.waitUntilCondition(any(Predicate.class), anyLong(), any(TimeUnit.class)))
                  .thenThrow(new InterruptedException("Job wait interrupted"));


            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> notebookService.executeNotebook(notebookId, userId));
            assertTrue(exception.getMessage().contains("Notebook execution interrupted"));
            assertTrue(exception.getCause() instanceof InterruptedException);
            assertTrue(Thread.currentThread().isInterrupted()); // Verify flag is set
        }
    }
}
