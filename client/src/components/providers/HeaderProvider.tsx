import React, { createContext, useContext, useState } from "react";

interface HeaderContextProps {
    header: string | undefined;
    setHeader: (header: string) => void;
}

interface HeaderProviderProps {
    children: React.ReactNode;
}

const HeaderContext = createContext<HeaderContextProps | undefined>(
    undefined
);

export const useHeader = (): HeaderContextProps => {
    const context = useContext(HeaderContext);
    if (!context) {
        throw new Error("useSocket must be used within a HeaderProvider");
    }
    return context;
};

export const HeaderProvider: React.FC<HeaderProviderProps> = ({
    children,
}) => {
    const [header, setHeader] = useState<string | undefined>(undefined);
    return (
        <HeaderContext.Provider value={{ header, setHeader }}>
            {children}
        </HeaderContext.Provider>
    );
};
