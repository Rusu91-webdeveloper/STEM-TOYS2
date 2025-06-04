#!/usr/bin/env node

/**
 * This script installs the dependencies needed for Brevo (Sendinblue) email integration
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

console.log(
  `${colors.cyan}Installing Brevo (Sendinblue) dependencies...${colors.reset}`
);

try {
  // Install the Brevo API client and types
  console.log(`${colors.blue}Installing sib-api-v3-sdk...${colors.reset}`);
  execSync("npm install sib-api-v3-sdk", { stdio: "inherit" });

  console.log(
    `\n${colors.green}✅ Brevo dependencies installed successfully!${colors.reset}`
  );

  // Create/update .env.local file with Brevo configuration if it doesn't exist
  const envPath = path.join(process.cwd(), ".env.local");

  // Check if .env.local exists
  if (fs.existsSync(envPath)) {
    console.log(
      `\n${colors.yellow}Updating ${envPath} with Brevo environment variables...${colors.reset}`
    );
    let envContent = fs.readFileSync(envPath, "utf8");

    // Check if Brevo variables are already in the file
    const hasBrevoApiKey = envContent.includes("BREVO_API_KEY");
    const hasBrevoSmtpLogin = envContent.includes("BREVO_SMTP_LOGIN");
    const hasBrevoSmtpKey = envContent.includes("BREVO_SMTP_KEY");

    // Append variables if they don't exist
    if (!hasBrevoApiKey) {
      envContent +=
        "\n# Brevo (Sendinblue) API key\nBREVO_API_KEY=your_brevo_api_key\n";
    }

    if (!hasBrevoSmtpLogin) {
      envContent +=
        "\n# Brevo SMTP credentials (alternative to API key)\nBREVO_SMTP_LOGIN=your_smtp_login\n";
    }

    if (!hasBrevoSmtpKey) {
      envContent += "BREVO_SMTP_KEY=your_smtp_key\n";
    }

    // Update email from settings if not present
    if (!envContent.includes("EMAIL_FROM")) {
      envContent +=
        "\n# Email sender configuration\nEMAIL_FROM=noreply@yourdomain.com\n";
    }

    if (!envContent.includes("EMAIL_FROM_NAME")) {
      envContent += "EMAIL_FROM_NAME=YourStoreName\n";
    }

    fs.writeFileSync(envPath, envContent);
    console.log(
      `${colors.green}✅ Environment variables added to ${envPath}${colors.reset}`
    );
  } else {
    console.log(
      `\n${colors.blue}Creating ${envPath} with Brevo environment variables...${colors.reset}`
    );
    const envContent = `# Brevo (Sendinblue) API key
BREVO_API_KEY=your_brevo_api_key

# Brevo SMTP credentials (alternative to API key)
BREVO_SMTP_LOGIN=your_smtp_login
BREVO_SMTP_KEY=your_smtp_key

# Email sender configuration 
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=YourStoreName
`;

    fs.writeFileSync(envPath, envContent);
    console.log(
      `${colors.green}✅ Environment variables file created at ${envPath}${colors.reset}`
    );
  }

  console.log(`\n${colors.magenta}Next steps:${colors.reset}`);
  console.log(
    `1. Go to ${colors.cyan}https://app.brevo.com${colors.reset} and sign up for a free account`
  );
  console.log(`2. Navigate to SMTP & API → API Keys to generate your API key`);
  console.log(
    `3. Replace 'your_brevo_api_key' in .env.local with your actual API key`
  );
  console.log(
    `4. Update EMAIL_FROM and EMAIL_FROM_NAME with your actual values`
  );
  console.log(`5. Restart your Next.js development server`);
} catch (error) {
  console.error(
    `${colors.red}Error installing Brevo dependencies:${colors.reset}`,
    error
  );
  process.exit(1);
}
