import * as vscode from 'vscode';

export class GlobalStateStore {
  /**
   * Creates a new GlobalStateStore instance.
   * @param globalState VS Code's global state memento for persistent storage
   */
  constructor(private globalState: vscode.Memento) {}

  /**
   * Retrieves a value from the global state store
   * @param key The key to retrieve
   * @returns A promise that resolves to the stored value, or undefined if not found
   */
  async get<K>(key: string): Promise<K | undefined> {
    return this.globalState.get<K>(key);
  }

  /**
   * Stores a value in the global state store
   * @param key The key to store the value under
   * @param value The value to store
   * @returns A promise that resolves when the value is stored
   */
  async set<K>(key: string, value: K): Promise<void> {
    await this.globalState.update(key, value);
  }

  /**
   * Deletes a value from the global state store
   * @param key The key to delete
   * @returns A promise that resolves when the value is deleted
   */
  async delete(key: string): Promise<void> {
    await this.globalState.update(key, undefined);
  }
}