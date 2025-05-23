// This script creates an admin user directly in your development environment
// It uses the mock data approach similar to what's in the auth.ts file

const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

async function createAdminUser() {
  try {
    // Admin user details
    const adminUser = {
      id: "admin_" + Date.now(),
      name: "Rusu Emanuel",
      email: "rusu.emanuel.webdeveloper@gmail.com",
      role: "ADMIN",
      isActive: true,
    };

    // Hash the password
    const hashedPassword = await bcrypt.hash("Itist199!", 10);

    // Create user object with hashed password
    const user = {
      ...adminUser,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emailVerified: new Date().toISOString(),
    };

    // Path to the auth.ts file
    const authFilePath = path.join(__dirname, "..", "lib", "auth.ts");

    // Read the current file
    let authFileContent = fs.readFileSync(authFilePath, "utf8");

    // Check if the mock users array exists
    if (authFileContent.includes("const mockUsers = [")) {
      // Find the end of the mockUsers array
      const mockUsersStart = authFileContent.indexOf("const mockUsers = [");
      const mockUsersEnd = authFileContent.indexOf("];", mockUsersStart);

      // Extract the current mockUsers array
      const mockUsersArray = authFileContent.substring(
        mockUsersStart + "const mockUsers = [".length,
        mockUsersEnd
      );

      // Check if our admin user already exists in the array
      if (mockUsersArray.includes(adminUser.email)) {
        console.log("Admin user already exists in the mock data.");

        // Update the existing user to have admin role
        // This is a simple string replacement - in a real app you'd use a proper database
        const updatedContent = authFileContent.replace(
          /role: "user",(\s*)}(,?)\s*\/\/ Mock admin user with email rusu\.emanuel\.webdeveloper@gmail\.com/g,
          'role: "admin", // Updated to admin\n  }$2 // Mock admin user with email rusu.emanuel.webdeveloper@gmail.com'
        );

        fs.writeFileSync(authFilePath, updatedContent);
        console.log("Updated existing user to admin role.");
        return;
      }

      // Create the new admin user entry
      const adminUserEntry = `
  {
    id: "${adminUser.id}",
    name: "${adminUser.name}",
    email: "${adminUser.email}",
    password: "${hashedPassword}", // "Itist199!"
    isActive: true,
    role: "admin",
  }, // Mock admin user with email rusu.emanuel.webdeveloper@gmail.com`;

      // Insert the admin user into the mockUsers array
      const updatedMockUsers =
        authFileContent.substring(
          0,
          mockUsersStart + "const mockUsers = [".length
        ) +
        adminUserEntry +
        (mockUsersArray.trim() ? "," + mockUsersArray : "") +
        authFileContent.substring(mockUsersEnd);

      // Write the updated file
      fs.writeFileSync(authFilePath, updatedMockUsers);

      console.log("Admin user added to mock data successfully.");
    } else {
      console.error("Could not find mockUsers array in auth.ts file.");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

// Run the function
createAdminUser();
