CREATE TABLE public.sheet_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  spreadsheet_id TEXT,
  sheet_name TEXT NOT NULL DEFAULT 'Applications',
  column_map JSONB NOT NULL DEFAULT '{"company":"A","title":"B","url":"C","ats_score":"D","status":"E","followup_date":"F"}'::jsonb,
  auto_sync BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  last_row_count INTEGER,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sheet_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sheet_settings self all" ON public.sheet_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_sheet_settings_updated
  BEFORE UPDATE ON public.sheet_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();