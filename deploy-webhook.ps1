# PowerShell script to deploy Supabase Edge Function for PayPal webhook

Write-Host "=== Deploying PayPal Webhook Edge Function ===" -ForegroundColor Yellow

# Check if we're in the project root
if (-not (Test-Path ".\supabase\functions\paypal-webhook")) {
    Write-Host "Error: Could not find supabase\functions\paypal-webhook directory." -ForegroundColor Red
    Write-Host "Make sure you're running this script from the project root."
    exit 1
}

# Step 1: Login to Supabase if not already logged in
Write-Host "Checking Supabase login status..." -ForegroundColor Yellow
$loginStatus = npx supabase login status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "You need to login to Supabase first." -ForegroundColor Yellow
    Write-Host "Attempting to login now..." -ForegroundColor Yellow
    
    npx supabase login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Login failed. Please try manually with 'npx supabase login'" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Login successful!" -ForegroundColor Green
} else {
    Write-Host "Already logged in to Supabase." -ForegroundColor Green
}

# Step 2: Link the project if not already linked
if (-not (Test-Path ".\supabase\.temp\project-ref")) {
    Write-Host "Project not linked to Supabase." -ForegroundColor Yellow
    
    # List available projects
    Write-Host "Retrieving available projects..." -ForegroundColor Yellow
    $projects = npx supabase projects list 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to list projects. Check your login status and permissions." -ForegroundColor Red
        Write-Host "Error: $projects" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Available projects:" -ForegroundColor Cyan
    Write-Host $projects
    
    # Prompt for project reference
    $projectRef = Read-Host "Enter your project reference ID from the list above"
    
    if ([string]::IsNullOrWhiteSpace($projectRef)) {
        Write-Host "No project reference provided. Aborting." -ForegroundColor Red
        exit 1
    }
    
    # Link the project
    Write-Host "Linking to project $projectRef..." -ForegroundColor Yellow
    npx supabase link --project-ref $projectRef
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to link project. Check the project reference and try again." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Project linked successfully!" -ForegroundColor Green
} else {
    $projectRef = Get-Content ".\supabase\.temp\project-ref"
    Write-Host "Project already linked: $projectRef" -ForegroundColor Green
}

# Step 3: Deploy the function with debug output
Write-Host "Deploying paypal-webhook function..." -ForegroundColor Yellow
Write-Host "This may take a minute..." -ForegroundColor Yellow

# Run deployment with debug flag for more information
npx supabase functions deploy paypal-webhook --no-verify-jwt --debug

# Check if deployment was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "PayPal webhook function deployed successfully!" -ForegroundColor Green
    
    # Get the function URL
    if (Test-Path ".\supabase\.temp\project-ref") {
        $PROJECT_ID = Get-Content ".\supabase\.temp\project-ref"
        $FUNCTION_URL = "https://$PROJECT_ID.supabase.co/functions/v1/paypal-webhook"
        
        Write-Host "Webhook URL: $FUNCTION_URL" -ForegroundColor Green
        Write-Host "Important: Don't forget to set this URL in your PayPal Developer Dashboard." -ForegroundColor Yellow
        
        # Check if we can access the function
        Write-Host "Checking if function is accessible (this won't execute it)..." -ForegroundColor Yellow
        try {
            $response = Invoke-WebRequest -Uri $FUNCTION_URL -Method Head -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 404 -or $response.StatusCode -eq 405) {
                Write-Host "Function endpoint is accessible!" -ForegroundColor Green
            } else {
                Write-Host "Function endpoint returned status code $($response.StatusCode)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "Could not access function endpoint. This might be normal if it's properly secured." -ForegroundColor Yellow
            Write-Host "Error: $_" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Could not find project reference file to determine webhook URL." -ForegroundColor Yellow
    }
    
    # Instructions for next steps
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "1. Add the webhook URL to your PayPal Developer Dashboard"
    Write-Host "2. Configure webhook events to listen for 'PAYMENT.CAPTURE.COMPLETED' and 'CHECKOUT.ORDER.APPROVED'"
    Write-Host "3. Apply the database migration to create the required tables and functions"
    Write-Host "   Run: npx supabase db push"
} else {
    Write-Host "Deployment failed." -ForegroundColor Red
    
    # Troubleshooting advice
    Write-Host "`nTroubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Check your Supabase login status: npx supabase login status"
    Write-Host "2. Make sure you have the right permissions for the project"
    Write-Host "3. Try running directly with: npx supabase functions deploy paypal-webhook --no-verify-jwt --debug"
    Write-Host "4. Check the Supabase dashboard for more information"
    Write-Host "5. Make sure your project reference is correct"
    exit 1
}

Write-Host "`nDone!" -ForegroundColor Green