-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.credit_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  credits integer NOT NULL,
  price_cents integer NOT NULL,
  price_per_credit numeric NOT NULL,
  min_purchase integer NOT NULL DEFAULT 500,
  popular boolean NOT NULL DEFAULT false,
  description text,
  features ARRAY DEFAULT '{}'::text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT credit_plans_pkey PRIMARY KEY (id)
);
CREATE TABLE public.credit_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['purchase'::text, 'scraping'::text, 'refund'::text, 'bonus'::text])),
  description text,
  created_at timestamp with time zone DEFAULT now(),
  related_request_id uuid,
  payment_gateway text DEFAULT 'system'::text,
  gateway_transaction_id text UNIQUE,
  gateway_response jsonb,
  CONSTRAINT credit_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT credit_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT credit_transactions_related_task_id_fkey FOREIGN KEY (related_request_id) REFERENCES public.scraper_task(id)
);
CREATE TABLE public.pages (
  id uuid NOT NULL,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  published boolean NOT NULL DEFAULT false,
  meta_description text,
  CONSTRAINT pages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profile_buy_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'refunded'::text])),
  credits_purchased integer NOT NULL,
  amount_paid_cents integer NOT NULL,
  payment_gateway text NOT NULL,
  gateway_transaction_id text UNIQUE,
  gateway_response jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profile_buy_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT profile_buy_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  display_name text,
  credits integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  notification_settings jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.scraper_categories (
  id text NOT NULL,
  value text NOT NULL,
  label text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT scraper_categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.scraper_countries (
  id text NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT scraper_countries_pkey PRIMARY KEY (id)
);
CREATE TABLE public.scraper_data_types (
  id text NOT NULL,
  label text NOT NULL,
  restricted_to_plans ARRAY NOT NULL DEFAULT '{}'::text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT scraper_data_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.scraper_ratings (
  id text NOT NULL,
  value text NOT NULL,
  label text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT scraper_ratings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.scraper_task (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'running'::text, 'completed'::text, 'failed'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  config jsonb NOT NULL,
  progress integer NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  total_results integer DEFAULT 0,
  credits_used integer DEFAULT 0,
  error_message text,
  result_json_url text,
  result_csv_url text,
  CONSTRAINT scraper_task_pkey PRIMARY KEY (id),
  CONSTRAINT scraper_task_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);