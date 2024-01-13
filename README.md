## <a name="no-link"></a>Tauri + Next.js Task Manager for Windows

Task Manager desktop app for Windows built with Next.js, Tauri and Powershell.
This app uses **pnpm** as the Node.js dependency
manager. Performant thanks to Rust on the backend, good looking
with Next.js/Tailwind/Shadcn. Also you need Rust to run this app.

## <a name="no-link"></a>Technologies Used

- **Next.js**

Next.js is a React framework for building modern web applications. It provides server-side rendering (SSR) and static site generation (SSG) capabilities, resulting in faster page loads and improved SEO. Next.js simplifies the development process and offers features like automatic code splitting, routing, and hot module replacement.

**Tauri**

Tauri is a Rust based lightweight and flexible framework designed for building desktop applications with support for web technologies like server-side rendering (SSR) and static site generation (SSG). It creates modern, performant desktop applications.

**PowerShell**

PowerShell is a task automation framework and scripting language designed for system administration and automation. Developed by Microsoft, PowerShell is built on the .NET framework and provides a powerful command-line shell and scripting environment.

- **TypeScript**

TypeScript is a strongly typed superset of JavaScript that enhances code maintainability and scalability. It allows us to catch errors during development and provides better tooling support, leading to more robust applications.

- **Tailwind CSS**

Tailwind CSS is a utility-first CSS framework that enables rapid UI development. Its utility classes make it easy to create responsive and custom-designed user interfaces without writing custom CSS.

## <a name="no-link"></a>Features

### <a name="no-link"></a>Display System Info
Display information about the system, including hardware details, operating system version, and architecture. Get full disk drives
space analysis

## <a name="no-link"></a>Task Manager
Display all running processes, sort and filter them by any criteria, see how many CPU and Working Set each process consumes, stop a running process

## <a name="no-link"></a>Getting Started

### Running development server and use Tauri window

After cloning for the first time, set up git pre-commit hooks:

```shell
pnpm install husky --save-dev
```

To develop and run the frontend in a Tauri window:

```shell
pnpm dev
```

This will load the Next.js frontend directly in a Tauri webview window.

### Source structure

Next.js frontend source files are located in `src/` and Tauri Rust application source
files are located in `src-tauri/`.
