const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetchWithAuth = async (accessToken, url, options = {}) => {
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {...options, headers});

    if (response.status === 401) {
        console.error("Unauthorized, logging out...");
        throw new Error("Unauthorized");
    }

    return response;
};

export const getProductsPageable = async (accessToken, { page = 0, size = 10, id, name = "", categories = [], attributes = [], tags = [] }) => {
    const queryParams = [`page=${page}`, `size=${size}`];

    if (id) {
        queryParams.push(`id=${encodeURIComponent(id)}`);
    }

    if (name) {
        queryParams.push(`name=${encodeURIComponent(name)}`);
    }

    if(attributes && attributes.length > 0){
        console.log(attributes)
        attributes.forEach(attribute => {
            if (attribute) queryParams.push(`attributes${encodeURIComponent(`[${attribute.key}]`)}=${encodeURIComponent(attribute.value)}`);
        });
    }

    if(tags && tags.length > 0){
        tags.forEach(tag => {
            if (tag) queryParams.push(`tags${encodeURIComponent(`[${tag.key}]`)}=${encodeURIComponent(tag.value)}`);
        });
    }

    if (categories && categories.length > 0) {
        categories.forEach(category => {
            if (category) queryParams.push(`categories=${encodeURIComponent(category)}`);
        });
    }

    const queryString = queryParams.join("&");
    const response = await fetchWithAuth(accessToken, `/products?${queryString}`);
    return response.json();
};


export const createProduct = async (accessToken, productData) => {
    const response = await fetchWithAuth(accessToken, "/products", {
        method: "POST",
        body: JSON.stringify(productData),
    });
    return response.json();
};

export const getProductById = async (accessToken, productId) => {
    const response = await fetchWithAuth(accessToken, `/products/${productId}`);
    return response.json();
};

export const updateProduct = async (accessToken, productId, productData) => {
    const response = await fetchWithAuth(accessToken, `/products/${productId}`, {
        method: "PATCH",
        body: JSON.stringify(productData),
    });
    return response.json();
};

export const deleteProduct = async (accessToken, productId) => {
    const response = await fetchWithAuth(accessToken, `/products/${productId}`, {
        method: "DELETE",
    });
    return response.ok;
};

export const getRecipesPageable = async (accessToken, page = 0, size = 10) => {
    const response = await fetchWithAuth(accessToken, `/recipes?page=${page}&size=${size}`);
    return response.json();
};

export const deleteRecipe = async (accessToken, recipeId) => {
    const response = await fetchWithAuth(accessToken, `/recipes/${recipeId}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        const body = await response.json();
        throw new Error(`Failed to delete recipe. ${body.message}`);
    }
};

export const createRecipe = async (accessToken, recipeData) => {
    const response = await fetchWithAuth(accessToken, "/recipes", {
        method: "POST",
        body: JSON.stringify(recipeData),
    });
    if (!response.ok) {
        const body = await response.json();
        throw new Error(`Failed to create recipe. ${body.message}`);
    }
    return response.json();
};

export const getRecipeYield = async (accessToken, recipeId) => {
    const response = await fetchWithAuth(accessToken, `/recipes/${recipeId}/yield`);
    if (!response.ok) {
        const body = await response.json();
        throw new Error(`Failed to get recipe yield. ${body.message}`);
    }
    return response.json();
};

export const applyRecipe = async (accessToken, recipeId, amount) => {
    const response = await fetchWithAuth(accessToken, `/recipes/${recipeId}/apply`, {
        method: "POST",
        body: JSON.stringify({ amount }),
    });
    if (!response.ok) {
        const body = await response.json();
        throw new Error(`Failed to apply recipe. ${body.message}`);
    }
    return response.json();
};

export const getNotebooksPageable = async (accessToken, {page = 0, size = 10, name = ""} = {}) => {
    const queryParams = [`page=${page}`, `size=${size}`];

    if (name) {
        queryParams.push(`name=${encodeURIComponent(name)}`);
    }

    const queryString = queryParams.join("&");
    const response = await fetchWithAuth(accessToken, `/notebooks?${queryString}`);
    return response.json();
};

export const deleteNotebook = async (accessToken, notebookId) => {
    const response = await fetchWithAuth(accessToken, `/notebooks/${notebookId}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        const body = await response.json();
        throw new Error(`Failed to delete notebook. ${body.message}`);
    }
    return response.ok;
};
export const createNotebook = async (accessToken, notebookData) => {
    const response = await fetchWithAuth(accessToken, "/notebooks", {
        method: "POST",
        body: JSON.stringify(notebookData),
    });
    return response.json();
};

export const updateNotebook = async (accessToken, notebookId, notebookData) => {
    const response = await fetchWithAuth(accessToken, `/notebooks/${notebookId}`, {
        method: "PATCH",
        body: JSON.stringify(notebookData),
    });
    return response.json();
};

export const getNotebookById = async (accessToken, notebookId) => {
    const response = await fetchWithAuth(accessToken, `/notebooks/${notebookId}`);
    return response.json();
};

// Flow API endpoints
export const getFlowsPageable = async (accessToken, {page = 0, size = 10, name = ""} = {}) => {
    const queryParams = [`page=${page}`, `size=${size}`];

    if (name) {
        queryParams.push(`name=${encodeURIComponent(name)}`);
    }

    const queryString = queryParams.join("&");
    const response = await fetchWithAuth(accessToken, `/flows?${queryString}`);
    return response.json();
};

export const createFlow = async (accessToken, flowData) => {
    const response = await fetchWithAuth(accessToken, "/flows", {
        method: "POST",
        body: JSON.stringify(flowData),
    });
    return response.json();
};

export const getFlowById = async (accessToken, flowId) => {
    const response = await fetchWithAuth(accessToken, `/flows/${flowId}`);
    return response.json();
};

export const updateFlow = async (accessToken, flowId, flowData) => {
    const response = await fetchWithAuth(accessToken, `/flows/${flowId}`, {
        method: "PUT",
        body: JSON.stringify(flowData),
    });
    return response.json();
};

export const executeFlow = async (accessToken, flowId) => {
    const response = await fetchWithAuth(accessToken, `/flows/${flowId}/execute`, {
        method: "POST",
    });
    if (!response.ok) {
        const body = await response.json();
        throw new Error(`Failed to execute flow. ${body.message || 'Unknown error'}`);
    }
    return response.json();
};

export const deleteFlow = async (accessToken, flowId) => {
    const response = await fetchWithAuth(accessToken, `/flows/${flowId}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        const body = await response.json();
        throw new Error(`Failed to delete flow. ${body.message}`);
    }
    return response.ok;
};

// NodeTemplate API endpoints
export const getNodeTemplatesPageable = async (accessToken, {page = 0, size = 10, name = ""} = {}) => {
    const queryParams = [`page=${page}`, `size=${size}`];

    if (name) {
        queryParams.push(`name=${encodeURIComponent(name)}`);
    }

    const queryString = queryParams.join("&");
    const response = await fetchWithAuth(accessToken, `/node-templates?${queryString}`);
    return response.json();
};

export const createNodeTemplate = async (accessToken, nodeTemplateData) => {
    const response = await fetchWithAuth(accessToken, "/node-templates", {
        method: "POST",
        body: JSON.stringify(nodeTemplateData),
    });
    if (!response.ok) {
        const body = await response.json();
        throw new Error(`Failed to create node template. ${body.message || 'Unknown error'}`);
    }
    return response.json();
};

export const getNodeTemplateById = async (accessToken, nodeTemplateId) => {
    const response = await fetchWithAuth(accessToken, `/node-templates/${nodeTemplateId}`);
    if (!response.ok) {
        const body = await response.json();
        throw new Error(`Failed to get node template. ${body.message || 'Unknown error'}`);
    }
    return response.json();
};

export const updateNodeTemplate = async (accessToken, nodeTemplateId, nodeTemplateData) => {
    const response = await fetchWithAuth(accessToken, `/node-templates/${nodeTemplateId}`, {
        method: "PUT",
        body: JSON.stringify(nodeTemplateData),
    });
    if (!response.ok) {
        const body = await response.json();
        throw new Error(`Failed to update node template. ${body.message || 'Unknown error'}`);
    }
    return response.json();
};

export const deleteNodeTemplate = async (accessToken, nodeTemplateId) => {
    const response = await fetchWithAuth(accessToken, `/node-templates/${nodeTemplateId}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        const body = await response.json();
        throw new Error(`Failed to delete node template. ${body.message}`);
    }
    return response.ok;
};

// File/Folder API
export const listFolders = async (accessToken, parentId = null) => {
    const url = parentId ? `/files?parentId=${parentId}` : "/files";
    const response = await fetchWithAuth(accessToken, url);
    if (!response.ok) throw new Error(await response.text());
    return response.json();
};

export const createFolder = async (accessToken, { name, parentId }) => {
    const response = await fetchWithAuth(accessToken, "/files", {
        method: "POST",
        body: JSON.stringify({ name, type: "folder", parentId })
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
};

export const deleteFolder = async (accessToken, id) => {
    const response = await fetchWithAuth(accessToken, `/files/${id}`, {
        method: "DELETE"
    });
    if (!response.ok) throw new Error(await response.text());
    return true;
};

export const renameFolder = async (accessToken, id, newName) => {
    const response = await fetchWithAuth(accessToken, `/files/${id}/rename`, {
        method: "PATCH",
        body: JSON.stringify({ name: newName })
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
};

export const moveFolder = async (accessToken, id, newParentId) => {
    const response = await fetchWithAuth(accessToken, `/files/${id}/move`, {
        method: "PATCH",
        body: JSON.stringify({ parentId: newParentId })
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
};

export const toggleFavorite = async (accessToken, id) => {
    const response = await fetchWithAuth(accessToken, `/files/${id}/favorite`, {
        method: "PATCH"
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
};

export const saveSchemaFile = async (accessToken, schemaFile) => {
    const response = await fetchWithAuth(accessToken, "/schemas", {
        method: "POST",
        body: JSON.stringify(schemaFile),
    });
    if (!response.ok) {
        const body = await response.json();
        throw new Error(body.message || "Failed to save schema");
    }
    return response.json();
};

export const getSchemaFile = async (accessToken, schemaId) => {
    const response = await fetchWithAuth(accessToken, `/schemas/${schemaId}`);
    if (!response.ok) {
        const body = await response.json();
        throw new Error(body.message || "Failed to fetch schema");
    }
    return response.json();
};

export const listSchemaFiles = async (accessToken, folderId) => {
    const response = await fetchWithAuth(accessToken, `/schemas?folderId=${encodeURIComponent(folderId)}`);
    if (!response.ok) {
        const body = await response.json();
        throw new Error(body.message || "Failed to list schemas");
    }
    return response.json();
};

export const deleteSchemaFile = async (accessToken, schemaId) => {
    const response = await fetchWithAuth(accessToken, `/schemas/${schemaId}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        const body = await response.json();
        throw new Error(body.message || "Failed to delete schema");
    }
    return response.ok;
};

export const getFolderSchemaTree = async (accessToken) => {
    const response = await fetchWithAuth(accessToken, "/files/tree");
    return response.json();
};

// Schema Data Records API
export const createSchemaDataRecord = async (accessToken, schemaId, data) => {
    const response = await fetchWithAuth(accessToken, `/schema-data/${schemaId}`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error(`Failed to create data record: ${response.statusText}`);
    }
    
    return response.json();
};

export const getSchemaDataRecords = async (accessToken, schemaId) => {
    const response = await fetchWithAuth(accessToken, `/schema-data/${schemaId}`);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch data records: ${response.statusText}`);
    }
    
    return response.json();
};

export const getSchemaDataRecordsForTable = async (accessToken, schemaId) => {
    const response = await fetchWithAuth(accessToken, `/schema-data/${schemaId}/table`);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch table data: ${response.statusText}`);
    }
    
    return response.json();
};

export const getSchemaDataRecord = async (accessToken, recordId) => {
    const response = await fetchWithAuth(accessToken, `/schema-data/record/${recordId}`);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch data record: ${response.statusText}`);
    }
    
    return response.json();
};

export const updateSchemaDataRecord = async (accessToken, recordId, data) => {
    const response = await fetchWithAuth(accessToken, `/schema-data/record/${recordId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error(`Failed to update data record: ${response.statusText}`);
    }
    
    return response.json();
};

export const deleteSchemaDataRecord = async (accessToken, recordId) => {
    const response = await fetchWithAuth(accessToken, `/schema-data/record/${recordId}`, {
        method: 'DELETE'
    });
    
    if (!response.ok) {
        throw new Error(`Failed to delete data record: ${response.statusText}`);
    }
};

export const getSchemaDataRecordCount = async (accessToken, schemaId) => {
    const response = await fetchWithAuth(accessToken, `/schema-data/${schemaId}/count`);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch record count: ${response.statusText}`);
    }
    
    return response.json();
};
