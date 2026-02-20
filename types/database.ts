export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            modules: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    created_at?: string
                }
            }
            components: {
                Row: {
                    id: string
                    name: string
                    module_id: string
                    sort_order: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    module_id: string
                    sort_order: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    module_id?: string
                    sort_order?: number
                    created_at?: string
                }
            }
            statuses: {
                Row: {
                    id: string
                    name: string
                    category: 'TICKET' | 'QA'
                    color: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    category: 'TICKET' | 'QA'
                    color?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    category?: 'TICKET' | 'QA'
                    color?: string | null
                    created_at?: string
                }
            }
            teams: {
                Row: {
                    id: string
                    name: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    created_at?: string
                }
            }
            environments: {
                Row: {
                    id: string
                    name: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    created_at?: string
                }
            }
            developers: {
                Row: {
                    id: string
                    name: string
                    email: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    email?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    email?: string | null
                    created_at?: string
                }
            }
            developer_modules: {
                Row: {
                    developer_id: string
                    module_id: string
                    created_at: string
                }
                Insert: {
                    developer_id: string
                    module_id: string
                    created_at?: string
                }
                Update: {
                    developer_id?: string
                    module_id?: string
                    created_at?: string
                }
            }
            releases: {
                Row: {
                    id: string
                    name: string
                    start_date: string | null
                    end_date: string | null
                    active: boolean | null
                    responsible_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    start_date?: string | null
                    end_date?: string | null
                    active?: boolean | null
                    responsible_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    start_date?: string | null
                    end_date?: string | null
                    active?: boolean | null
                    responsible_id?: string | null
                    created_at?: string
                }
            }
            tickets: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    status_id: string | null
                    qa_status_id: string | null
                    dev_id: string | null
                    team_id: string | null
                    environment_id: string | null
                    release_id: string
                    code_freeze: boolean | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    status_id?: string | null
                    qa_status_id?: string | null
                    dev_id?: string | null
                    team_id?: string | null
                    environment_id?: string | null
                    release_id: string
                    code_freeze?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    status_id?: string | null
                    qa_status_id?: string | null
                    dev_id?: string | null
                    team_id?: string | null
                    environment_id?: string | null
                    release_id?: string
                    code_freeze?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
            }
            ticket_component_matrix: {
                Row: {
                    ticket_id: string
                    component_id: string
                    applies: boolean | null
                    notes: string | null
                }
                Insert: {
                    ticket_id: string
                    component_id: string
                    applies?: boolean | null
                    notes?: string | null
                }
                Update: {
                    ticket_id?: string
                    component_id?: string
                    applies?: boolean | null
                    notes?: string | null
                }
            }
        }
    }
}
