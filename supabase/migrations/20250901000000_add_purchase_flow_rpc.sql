-- Create profile_buy_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profile_buy_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    credits_purchased INTEGER NOT NULL,
    amount_paid_cents INTEGER NOT NULL,
    payment_gateway TEXT NOT NULL,
    gateway_transaction_id TEXT NOT NULL,
    gateway_response JSONB,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profile_buy_transactions_user_id
ON public.profile_buy_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_profile_buy_transactions_gateway_id
ON public.profile_buy_transactions(gateway_transaction_id);

-- Create credit_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    description TEXT,
    reference_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add index for user_id on credit_transactions
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id
ON public.credit_transactions(user_id);

-- Add index for reference_id on credit_transactions
CREATE INDEX IF NOT EXISTS idx_credit_transactions_reference_id
ON public.credit_transactions(reference_id);

-- Create or replace the finalize_dynamic_paypal_purchase function
CREATE OR REPLACE FUNCTION public.finalize_dynamic_paypal_purchase(
    user_id_input UUID,
    credits_to_add INTEGER,
    amount_cents_input INTEGER,
    gateway_id_input TEXT,
    gateway_payload JSONB
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    transaction_id UUID;
    result JSONB;
BEGIN
    -- Start a transaction block for atomicity
    BEGIN
        -- 1. Insert the purchase record
        INSERT INTO public.profile_buy_transactions (
            user_id,
            credits_purchased,
            amount_paid_cents,
            payment_gateway,
            gateway_transaction_id,
            gateway_response,
            status
        ) VALUES (
            user_id_input,
            credits_to_add,
            amount_cents_input,
            'paypal',
            gateway_id_input,
            gateway_payload,
            'completed'
        )
        RETURNING id INTO transaction_id;

        -- 2. Update the user's credit balance
        UPDATE public.profiles
        SET 
            credits = COALESCE(credits, 0) + credits_to_add,
            updated_at = now()
        WHERE id = user_id_input;

        -- 3. Log the transaction in the credit ledger
        INSERT INTO public.credit_transactions (
            user_id,
            type,
            amount,
            description,
            reference_id
        ) VALUES (
            user_id_input,
            'purchase',
            credits_to_add,
            'Purchase of ' || credits_to_add || ' credits via PayPal',
            transaction_id
        );

        -- Return success result
        result := json_build_object(
            'success', true,
            'transaction_id', transaction_id,
            'credits_added', credits_to_add,
            'user_id', user_id_input
        );

        RETURN result;
    EXCEPTION
        WHEN OTHERS THEN
            -- Log error details
            RAISE LOG 'Error in finalize_dynamic_paypal_purchase: %', SQLERRM;
            
            -- Return error result
            result := json_build_object(
                'success', false,
                'error', SQLERRM,
                'error_code', SQLSTATE
            );
            
            -- Re-raise the exception
            RAISE;
    END;
END;
$$;