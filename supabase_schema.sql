-- =========================================================
-- OMNI TIME: Database Schema with Row Level Security (RLS)
-- Run this script in the Supabase SQL Editor (SQL Editor tab)
-- =========================================================

-- 1. Create agenda_items table
CREATE TABLE IF NOT EXISTS public.agenda_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('event', 'task')),
    category TEXT NOT NULL DEFAULT 'Work',
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create documents table (for Date attachments & Item attachments)
CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id TEXT REFERENCES public.agenda_items(id) ON DELETE CASCADE,
    date DATE,
    name TEXT NOT NULL,
    size TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('upload', 'omni_space')),
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
-- This ensures User A CANNOT see or modify User B's items
ALTER TABLE public.agenda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for agenda_items
CREATE POLICY "Users can view their own agenda items"
    ON public.agenda_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agenda items"
    ON public.agenda_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agenda items"
    ON public.agenda_items FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agenda items"
    ON public.agenda_items FOR DELETE
    USING (auth.uid() = user_id);

-- 5. Create RLS Policies for documents
CREATE POLICY "Users can view their own documents"
    ON public.documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
    ON public.documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
    ON public.documents FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
    ON public.documents FOR DELETE
    USING (auth.uid() = user_id);

-- 6. Indexes for ultra-fast calendar queries
CREATE INDEX IF NOT EXISTS idx_agenda_items_user_date ON public.agenda_items (user_id, date);
CREATE INDEX IF NOT EXISTS idx_documents_user_date ON public.documents (user_id, date);
CREATE INDEX IF NOT EXISTS idx_documents_user_item ON public.documents (user_id, item_id);
