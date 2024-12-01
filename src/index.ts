import * as rl from 'readline-sync';
import { chalk, Colors } from './colorize';
import Table from 'cli-table3';
import fs from 'fs';

class Heading {
  private readonly heading: string = chalk(
    `
    ██████████████████████████████████████████████████████████████
    █▄─▄▄─█▄─▀─▄█▄─▄▄─█▄─▄▄─█▄─▀█▄─▄█─▄▄▄▄█▄─▄▄─█▀▀▀▀▀██▄─▄█─▄─▄─█
    ██─▄█▀██▀─▀███─▄▄▄██─▄█▀██─█▄▀─██▄▄▄▄─██─▄█▀█████████─████─███
    ▀▄▄▄▄▄▀▄▄█▄▄▀▄▄▄▀▀▀▄▄▄▄▄▀▄▄▄▀▀▄▄▀▄▄▄▄▄▀▄▄▄▄▄▀▀▀▀▀▀▀▀▄▄▄▀▀▄▄▄▀▀`,
    Colors.cyan,
  );
  public getHeading(): string {
    return this.heading;
  }
}

class MainMenu {
  private readonly options: string[] = [
    'View expenses',
    'Add expense',
    'Change income',
    'Edit expenses',
    'Backup',
  ];
  public viewOptions(): string[] {
    return this.options;
  }
}

class App {
  private readonly rl = rl;
  private currentDirectory: number;
  private readonly mainMenu: string[] = new MainMenu().viewOptions();
  private readonly heading = new Heading().getHeading();
  private expenses: string[][];
  private cwd: string = process.cwd();
  private readonly table = new Table({
    head: ['Date', 'Description', 'Amount'],
    colWidths: [15, 30, 30],
  });

  private getExpenses(): void {
    const data = fs.readFileSync(this.cwd + '/src/expenses.json', {
      encoding: 'utf-8',
    });
    this.expenses = JSON.parse(data).map((n: string[]) =>
      Object.values(n).map((n) => n),
    );
    this.table.length = 0;
    this.expenses.forEach((n) => this.table.push(n));
  }
  private setUp(): void {
    this.getExpenses();
    this.renderHeading();
  }
  public run(): void {
    try {
      this.setUp();
      this.currentDirectory = this.rl.keyInSelect(
        this.mainMenu,
        'Choose directory',
        {
          cancel: true,
        },
      );
      if (this.currentDirectory === -1) this.forceQuit();

      switch (this.currentDirectory) {
        case 0: {
          this.renderViewExpensesPage();
          break;
        }
        case 1: {
          this.addExpense();
          break;
        }
        case 2: {
          this.renderHeading();
          console.log('This page has not been implemented yet');
          const returnToMain = this.rl.keyInYN(
            'Data updated successfully, return to main?',
          );
          if (returnToMain) this.run();
          break;
        }
        case 3: {
          this.editExpenses();
          break;
        }
        case 4: {
          this.backup();
          break;
        }
        default: {
          this.renderHeading();
          console.log(chalk('Invalid option, try again', Colors.bgRed));
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err instanceof TypeError) {
          this.reportError(
            chalk(
              chalk(
                'Error:\nAn unexpected error occurred ' + err,
                Colors.bgRed,
              ),
              Colors.bold,
            ),
            chalk(
              chalk(
                '\nMethod name: ' +
                  this.run.name +
                  '\nprocess exiting with code 1',
                Colors.red,
              ),
              Colors.bold,
            ),
          );
        }
        this.reportError(err.message, err.stack);
      } else {
        this.reportError(
          chalk('Error:\nAn unexpected error occurred ' + err, Colors.red),
          'Method name: ' + this.run.name + '\nprocess exiting with code 1',
        );
      }
    }
  }
  private backup(): void {
    this.renderHeading();
    const payloadForJsonFile = this.expenses.map((n) => ({
      date: n[0],
      description: n[1],
      amount: n[2],
    }));
    fs.writeFileSync(
      this.cwd + '/src/backups/' + new Date() + '.json',
      JSON.stringify(payloadForJsonFile, null, 2),
      { encoding: 'utf-8' },
    );
    const returnToMain = this.rl.keyInYN(
      'Data backed up successfully, return to main?',
    );
    if (returnToMain) this.run();
  }
  private renderHeading(): void {
    console.clear();
    console.log(this.heading + '\n');
  }
  private addExpense(): void {
    this.renderHeading();

    const date = this.rl.question('Date of expense: ').trim();
    this.renderHeading();
    console.log(chalk('Entered date: ' + date, Colors.magenta));
    const proceedWithDate = this.rl.keyInYN(
      'Proceed (y) or restart process (n)?',
    );
    if (proceedWithDate === false) this.addExpense();

    this.renderHeading();
    const description = this.rl.question('Description of expense: ').trim();
    this.renderHeading();
    console.log(
      chalk('Description of expense: ' + description, Colors.magenta),
    );
    const proceedWithDescription = this.rl.keyInYN(
      'Proceed (y) or restart process (n)? ',
    );
    if (proceedWithDescription === false) this.addExpense();

    this.renderHeading();
    const amount = this.rl.question('Expense amount: ').trim();
    this.renderHeading();
    console.log(chalk('Expense amount inputted: ' + amount, Colors.magenta));
    const proceedWithAmount = this.rl.keyInYN(
      'Proceed (y) or restart process (n)? ',
    );
    if (proceedWithAmount === false) this.addExpense();

    this.renderHeading();
    const payload = {
      date,
      description,
      amount: Number(amount).toFixed(2) + '',
    };
    const payloadToWrite = this.expenses.map((n) => ({
      date: n[0],
      description: n[1],
      amount: n[2],
    }));
    payloadToWrite.push(payload);
    console.log(chalk('Expense created:', Colors.green));
    console.log(payload);
    const addExpenseDecision = this.rl.keyInYN(
      'Confirm Expense: (y) for Yes (n) for No',
    );
    if (addExpenseDecision === false) this.addExpense();

    fs.writeFileSync(
      this.cwd + '/src/backups/' + new Date() + '.json',
      JSON.stringify(payloadToWrite, null, 2),
      { encoding: 'utf-8' },
    );
    fs.writeFileSync(
      this.cwd + '/src/expenses.json',
      JSON.stringify(payloadToWrite, null, 2),
      { encoding: 'utf-8' },
    );
    const returnToMain = this.rl.keyInSelect(
      ['Main menu', 'Add expense'],
      'Data created successfully, return to main?',
    );
    if (returnToMain === 0) this.run();
    if (returnToMain === 1) this.addExpense();
  }

  private editExpenses(): void {
    this.renderHeading();
    const result = this.rl.keyInSelect(
      this.expenses.flatMap((n) => n[0] + ' ' + n[1] + ' ' + n[2]),
      'Choose expense to edit: ',
    );

    if (result === -1) this.forceQuit();

    const expenseToEdit = this.expenses[result];
    this.renderHeading();
    console.log(chalk('\nExpense to edit:', Colors.magenta));
    console.log(expenseToEdit);
    const field = this.rl.keyInSelect(
      expenseToEdit,
      'Which field do you want to edit?',
    );

    this.renderHeading();
    console.log(chalk('\nField to edit:', Colors.magenta));
    console.log(expenseToEdit[field]);

    const proceed = this.rl.keyInYN('Proceed (y) or restart process (n)?');
    if (proceed === false) this.editExpenses();

    this.renderHeading();
    console.log(
      chalk(
        'Replace field ' + expenseToEdit[field] + ' with: ',
        Colors.magenta,
      ),
    );
    let editedField = this.rl.question(
      'What do you want to replace this field with? ',
    );
    if (field === 2) editedField = Number(editedField).toFixed(2) + '';

    console.log(chalk(editedField, Colors.magenta));

    const finalProceed = this.rl.keyInYN(
      'Validate Edited field: Proceed (y) or restart process (n) ',
    );
    if (!finalProceed) this.editExpenses();

    this.expenses[result][field] = editedField;
    const payloadForJsonFile = this.expenses.map((n) => ({
      date: n[0],
      description: n[1],
      amount: n[2],
    }));
    fs.writeFileSync(
      this.cwd + '/src/expenses.json',
      JSON.stringify(payloadForJsonFile, null, 2),
      'utf-8',
    );

    const returnToMain = this.rl.keyInYN(
      'Data updated successfully, return to main?',
    );
    if (returnToMain) this.run();
  }
  private renderViewExpensesPage(): void {
    this.renderHeading();
    console.log(this.table.toString());
    console.log(
      chalk(
        'TOTAL: ' +
          this.expenses.reduce((acc, curr) => acc + Number(curr.at(-1)), 0),
        Colors.cyan,
      ),
    );
    const yOrN = this.rl.keyInYN('Return to main (Y) or exit program (N)?');
    if (yOrN) {
      this.run();
    }
  }
  private forceQuit(): void {
    process.exit(0);
  }
  private reportError(message: string, methodName: string): void {
    console.clear();
    console.error(message, methodName);
    process.exit(1);
  }
}

const app = new App();
app.run();
