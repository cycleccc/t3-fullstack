#!/usr/bin/env node

const { Command } = require("commander");
const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const ejs = require("ejs");

const program = new Command();

program
  .version("1.0.0")
  .description("A custom project scaffold tool")
  .command("create <projectName>")
  .action(async (projectName) => {
    const templateDir = path.join(__dirname, "../template");
    const targetDir = path.join(process.cwd(), projectName);

    // 提示用户输入选项
    const answers = await inquirer.prompt([
      { name: "description", message: "Enter project description:" },
      { name: "author", message: "Enter author name:" },
    ]);

    // 拷贝模板并替换占位符
    fs.mkdirSync(targetDir, { recursive: true });
    fs.readdirSync(templateDir).forEach((file) => {
      const content = fs.readFileSync(path.join(templateDir, file), "utf-8");
      const result = ejs.render(content, { ...answers, projectName });
      fs.writeFileSync(path.join(targetDir, file), result);
    });

    console.log(chalk.green(`\nProject ${projectName} created successfully!`));
  });

program.parse(process.argv);
