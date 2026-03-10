import * as vscode from 'vscode';

export class GlobalStateStore {
  constructor(private globalState: vscode.Memento) {}

  async get<K>(key: string): Promise<K | undefined> {
    return this.globalState.get<K>(key);
  }

  async set<K>(key: string, value: K): Promise<void> {
    await this.globalState.update(key, value);
  }

  async delete(key: string): Promise<void> {
    await this.globalState.update(key, undefined);
  }
}