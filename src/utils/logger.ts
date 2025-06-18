import chalk from 'chalk';
export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`${chalk.blue('[INFO]')} ${message}`, ...filterArgs(args));
  },
  error: (message: string, error?: any) => {
    console.error(`${chalk.red('[ERROR]')} ${message}`);
    if (error) {
      if (error instanceof Error) {
        console.error(chalk.red(`  ${error.name}: ${error.message}`));
        if (error.stack) {
          console.error(chalk.gray(`  ${error.stack.split('\n').slice(1).join('\n  ')}`));
        }
      } else {
        console.error(chalk.red('  Details:'), error);
      }
    }
  },
  warning: (message: string, ...args: any[]) => {
    console.warn(`${chalk.yellow('[WARNING]')} ${message}`, ...filterArgs(args));
  },
  success: (message: string, ...args: any[]) => {
    console.log(`${chalk.green('[SUCCESS]')} ${message}`, ...filterArgs(args));
  },
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`${chalk.magenta('[DEBUG]')} ${message}`, ...filterArgs(args));
    }
  }
};
function filterArgs(args: any[]): any[] {
  return args.filter(arg => arg !== undefined && arg !== null);
} 