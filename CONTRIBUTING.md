# Contribution Guide for Outport

Thank you for considering contributing to [**Outport**](https://github.com/GMShahzaib/outport)! Contributions are vital to improving the library. This guide outlines the steps to effectively contribute, including linking the package with a tester project for local testing.

---

## How to Contribute

1. **Fork the Repository**  
   Fork the [Outport repository](https://github.com/GMShahzaib/outport) to your GitHub account.

2. **Clone the Repository**  
   Clone the forked repository to your local machine:

   ```bash
   git clone https://github.com/GMShahzaib/outport.git
   cd outport
   ```

3. **Install Dependencies**  
   Install the required dependencies for development:

   ```bash
   npm install
   ```

4. **Create a New Branch**  
   Create a branch for your feature or bug fix:

   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **Link the Package Locally**  
   Outport is an NPM package, so you need to link it to a tester project for local testing. Use the following steps:

   ### Link Outport Locally
   Run this command in the Outport repository root directory:

   ```bash
   npm link
   ```

   ### Link Outport in the Tester Project
   Go to the root of your tester project (an Express-based app where you want to test Outport):

   ```bash
   npm link outport
   ```

6. **Test Your Changes**  
   Make changes to the Outport source code, then test it in your linked tester project. Restart your tester project to see the changes reflected.

7. **Unlinking (Optional)**  
   To unlink the local package, run the following commands:

   ```bash
   npm unlink outport
   ```

   In the Outport repository:

   ```bash
   npm unlink
   ```

8. **Write and Update Documentation**  
   Ensure any new features or modifications are documented in the README.md or other relevant files.

9. **Commit Your Changes**  
   Once you’re happy with your changes, stage and commit them:

   ```bash
   git add .
   git commit -m "Describe the changes in detail"
   ```

10. **Push Your Changes**  
    Push the changes to your forked repository:

    ```bash
    git push origin feature/your-feature-name
    ```

11. **Open a Pull Request**  
    Open a pull request (PR) to the [main repository](https://github.com/GMShahzaib/outport), describing your changes and the problem they solve.

---

## Guidelines

- **Code Style**: Follow the existing structure and formatting.
- **Documentation**: Include detailed descriptions and examples for any new functionality.
- **Backward Compatibility**: Ensure your changes do not break existing functionality.
- **Testing**: Test your changes in the tester project thoroughly.

---

## Reporting Issues

If you encounter a bug or have a feature suggestion, please open an issue in the repository with:

- A clear and descriptive title.
- Detailed steps to reproduce (if reporting a bug).
- Any relevant logs or screenshots.

---

## Getting Help

If you have any questions, you can reach out:

- **GitHub Repository**: [Outport on GitHub](https://github.com/GMShahzaib/outport)
- **Email**: Contact the maintainer at `gms.shahzaib@gmail.com`.

---

Thank you for contributing to [**Outport**](https://github.com/GMShahzaib/outport)! Your efforts help make the library more robust and user-friendly. 🎉