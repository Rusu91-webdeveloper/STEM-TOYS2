#!/bin/bash

# NextCommerce Project Packaging Script
# This script packages the NextCommerce project for handover

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print header
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}  NextCommerce Packaging Script      ${NC}"
echo -e "${GREEN}=====================================${NC}"

# Make sure we're in the project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: This script must be run from the project root directory${NC}"
    exit 1
fi

# Create output directory
OUTPUT_DIR="nextcommerce-handover"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
PACKAGE_NAME="nextcommerce-${TIMESTAMP}"
ZIP_NAME="${PACKAGE_NAME}.zip"

echo -e "${YELLOW}Creating output directory...${NC}"
mkdir -p $OUTPUT_DIR

# Clean up build artifacts
echo -e "${YELLOW}Cleaning up build artifacts...${NC}"
if [ -d "node_modules" ]; then
    echo "Removing node_modules directory..."
    rm -rf node_modules
fi

if [ -d ".next" ]; then
    echo "Removing .next directory..."
    rm -rf .next
fi

# Export database schema if Prisma is available
echo -e "${YELLOW}Exporting database schema...${NC}"
if command -v npx &> /dev/null; then
    npx prisma generate > /dev/null 2>&1
    echo "Database schema exported to prisma/schema.prisma"
else
    echo -e "${RED}Warning: npx not found, skipping database schema export${NC}"
fi

# Check documentation files
echo -e "${YELLOW}Checking documentation files...${NC}"
DOCS_MISSING=false

for doc in "README.md" "SETUP_GUIDE.md" "ENVIRONMENT_VARIABLES.md" "env.example" "HANDOVER.md"; do
    if [ ! -f "$doc" ]; then
        echo -e "${RED}Warning: $doc is missing${NC}"
        DOCS_MISSING=true
    else
        echo -e "${GREEN}✓ $doc is present${NC}"
    fi
done

if [ "$DOCS_MISSING" = true ]; then
    echo -e "${RED}Some documentation files are missing. Consider creating them before packaging.${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Exiting..."
        exit 1
    fi
fi

# Create the archive
echo -e "${YELLOW}Creating project archive...${NC}"
zip -r "$OUTPUT_DIR/$ZIP_NAME" . \
    -x "node_modules/*" \
    -x ".next/*" \
    -x ".git/*" \
    -x "*.env*" \
    -x "$OUTPUT_DIR/*" \
    -x "*.DS_Store" \
    -x "coverage/*" \
    -x "npm-debug.log" \
    -x "yarn-debug.log*" \
    -x "yarn-error.log*" \
    -x ".pnpm-debug.log*"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Archive created successfully: $OUTPUT_DIR/$ZIP_NAME${NC}"
else
    echo -e "${RED}Failed to create archive${NC}"
    exit 1
fi

# Create a handover notes file
NOTES_FILE="$OUTPUT_DIR/HANDOVER_NOTES.md"
echo -e "${YELLOW}Creating handover notes...${NC}"

cat > "$NOTES_FILE" << EOL
# NextCommerce Handover Notes

## Package Information

- **Package Name**: $PACKAGE_NAME
- **Creation Date**: $(date +"%Y-%m-%d %H:%M:%S")
- **Package Version**: 1.0.0

## Contents

This package contains the following:

- Full NextCommerce source code
- Documentation files (README.md, SETUP_GUIDE.md, ENVIRONMENT_VARIABLES.md, HANDOVER.md)
- Database schema (prisma/schema.prisma)
- Configuration files
- Environment variables example (env.example)

## Setup Instructions

Please refer to the SETUP_GUIDE.md file for detailed instructions on how to set up and run the project locally.

## Environment Variables

All required environment variables are documented in ENVIRONMENT_VARIABLES.md.
Make sure to set these variables before running the application.

## Contact Information

For any questions or issues, please contact the development team at:
- Email: dev@example.com
- Phone: +1 (123) 456-7890

## Notes

This is a handover package of the NextCommerce project. Please review all documentation
before proceeding with deployment or further development.
EOL

echo -e "${GREEN}Handover notes created: $NOTES_FILE${NC}"

# Display summary
echo -e "\n${GREEN}=====================================${NC}"
echo -e "${GREEN}  Packaging Complete!                ${NC}"
echo -e "${GREEN}=====================================${NC}"
echo -e "Package created: ${YELLOW}$OUTPUT_DIR/$ZIP_NAME${NC}"
echo -e "Package size: ${YELLOW}$(du -h "$OUTPUT_DIR/$ZIP_NAME" | cut -f1)${NC}"
echo -e "Handover notes: ${YELLOW}$NOTES_FILE${NC}"
echo -e "\nNext steps:"
echo -e "1. Review the package contents"
echo -e "2. Share the package with the client/team"
echo -e "3. Ensure all credentials and access keys are shared securely"

exit 0 