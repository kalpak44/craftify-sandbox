import React, {createContext, useCallback, useContext, useState} from "react";

const FileStructureContext = createContext({
    version: 0, notifyFileStructureChanged: () => {
    }
});

export const FileStructureProvider = ({children}) => {
    const [version, setVersion] = useState(0);
    const notifyFileStructureChanged = useCallback(() => setVersion(v => v + 1), []);
    return (
        <FileStructureContext.Provider value={{version, notifyFileStructureChanged}}>
            {children}
        </FileStructureContext.Provider>
    );
};

export const useFileStructureContext = () => useContext(FileStructureContext); 