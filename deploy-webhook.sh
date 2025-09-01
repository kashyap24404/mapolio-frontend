#!/bin/bash

# Script to deploy Supabase Edge Function for PayPal webhook

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Deploying PayPal Webhook Edge Function ===${NC}"

# Check if we're in the project root
if [ ! -d "./supabase/functions/paypal-webhook" ]; then
    echo -e "${RED}Error: Could not find supabase/functions/paypal-webhook directory.${NC}"
    echo "Make sure you're running this script from the project root."
    exit 1
fi

# Use npx to run Supabase CLI commands instead of requiring global installation
echo -e "${YELLOW}Checking Supabase login status...${NC}"
npx supabase login status || npx supabase login

# Link to the project if not already linked
if [ ! -f "./supabase/.temp/project-ref" ]; then
    echo -e "${YELLOW}Linking to Supabase project...${NC}"
    npx supabase link
fi

# Deploy the function
echo -e "${YELLOW}Deploying paypal-webhook function...${NC}"
npx supabase functions deploy paypal-webhook --no-verify-jwt

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}PayPal webhook function deployed successfully!${NC}"
    
    # Get the function URL
    PROJECT_ID=$(cat ./supabase/.temp/project-ref)
    FUNCTION_URL="https://${PROJECT_ID}.supabase.co/functions/v1/paypal-webhook"
    
    echo -e "${GREEN}Webhook URL: ${FUNCTION_URL}${NC}"
    echo -e "${YELLOW}Important: Don't forget to set this URL in your PayPal Developer Dashboard.${NC}"
    
    # Instructions for next steps
    echo -e "\n${YELLOW}Next steps:${NC}"
    echo "1. Add the webhook URL to your PayPal Developer Dashboard"
    echo "2. Configure webhook events to listen for 'PAYMENT.CAPTURE.COMPLETED' and 'CHECKOUT.ORDER.APPROVED'"
    echo "3. Apply the database migration to create the required tables and functions"
    echo "   Run: npx supabase db push"
else
    echo -e "${RED}Deployment failed.${NC}"
    exit 1
fi

echo -e "\n${GREEN}Done!${NC}"