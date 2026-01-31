import { create } from 'zustand';

interface UiState {
    isSidebarOpen: boolean;
    isModalOpen: boolean;
    modalContent: React.ReactNode | null;
    theme: 'light' | 'dark';

    // Actions
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    openModal: (content: React.ReactNode) => void;
    closeModal: () => void;
    setTheme: (theme: 'light' | 'dark') => void;
    toggleTheme: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
    isSidebarOpen: true,
    isModalOpen: false,
    modalContent: null,
    theme: 'light',

    toggleSidebar: () => {
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
    },

    setSidebarOpen: (open) => {
        set({ isSidebarOpen: open });
    },

    openModal: (content) => {
        set({ isModalOpen: true, modalContent: content });
    },

    closeModal: () => {
        set({ isModalOpen: false, modalContent: null });
    },

    setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
    },

    toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    },
}));
