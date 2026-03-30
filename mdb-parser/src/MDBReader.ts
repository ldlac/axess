import { Database } from "./Database.js";
import { PageType, assertPageType } from "./PageType.js";
import {
  type SysObject,
  isSysObjectType,
  isSystemObject,
  SysObjectTypes,
} from "./SysObject.js";
import { Table } from "./Table.js";
import type { SortOrder } from "./types.js";
import { getMSysObjectsTable } from "./systemTables.js";
import { maskTableId } from "./util.js";

export interface Options {
  password?: string | undefined;
}

export type ByteBuffer = Uint8Array | ArrayBuffer;

function toBuffer(input: ByteBuffer): Buffer {
  if (input instanceof ArrayBuffer) {
    return Buffer.from(new Uint8Array(input));
  }
  return Buffer.from(input);
}

export default class MDBReader {
  #buffer: Buffer;
  #sysObjects: SysObject[];
  #database: Database;

  constructor(buffer: ByteBuffer, { password }: Options | undefined = {}) {
    this.#buffer = toBuffer(buffer);

    assertPageType(this.#buffer, PageType.DatabaseDefinitionPage);

    this.#database = new Database(this.#buffer, password ?? "");

    const mSysObjectsTable = getMSysObjectsTable(this.#database).getData<{
      Id: number;
      Name: string;
      Type: number;
      Flags: number;
    }>({
      columns: ["Id", "Name", "Type", "Flags"],
    });

    this.#sysObjects = mSysObjectsTable.map((mSysObject) => {
      const flags = mSysObject.Flags;
      const name = mSysObject.Name;
      const id = mSysObject.Id;
      
      const isSystemByFlags = (flags & 0x80000000) !== 0 || (flags & 0x02) !== 0;
      const isSystemById = id < 0;
      const isSystem = isSystemByFlags || isSystemById;
      
      const isUserTable = !isSystem && !name.startsWith('MSys') && 
        name !== 'DataAccessPages' && name !== 'Forms' && name !== 'Reports' &&
        name !== 'Modules' && name !== 'Scripts' && name !== 'SysRel' &&
        name !== 'AccessLayout' && name !== 'SummaryInfo' && name !== 'UserDefined';
      
      const objectType = isUserTable ? 1 : (isSystem ? 3 : 0);
      return {
        objectName: name,
        objectType: objectType,
        tablePage: maskTableId(id),
        flags: flags,
      };
    });
  }

  /**
   * Date when the database was created
   */
  getCreationDate(): Date | null {
    return this.#database.getCreationDate();
  }

  /**
   * Database password
   */
  getPassword(): string | null {
    return this.#database.getPassword();
  }

  /**
   * Default sort order
   */
  getDefaultSortOrder(): SortOrder {
    return this.#database.getDefaultSortOrder();
  }

  /**
   * Get all table names
   */
  getTableNames(options?: {
    systemTables?: boolean;
    linkedTables?: boolean;
  }): string[] {
    const filterSystem = options?.systemTables ?? false;
    const filterLinked = options?.linkedTables ?? false;

    let tables = this.#sysObjects
      .filter((obj) => {
        const systemObject = isSystemObject(obj);
        
        if (filterSystem && filterLinked) {
          return systemObject || obj.objectType === 6;
        }
        if (filterSystem) {
          return systemObject;
        }
        if (filterLinked) {
          return obj.objectType === 6;
        }

        return obj.objectType === 1;
      })
      .map((obj) => obj.objectName);

    // Remove duplicates
    tables = [...new Set(tables)];

    return tables;
  }

  /**
   * Get a table by name
   */
  getTable(name: string): Table {
    const sysObject = this.#sysObjects.find(
      (obj) => obj.objectName === name,
    );

    if (sysObject === undefined) {
      throw new Error(`Could not find table with name ${name}`);
    }

    if (sysObject.objectType === null) {
      throw new Error(`Object ${name} is not a table`);
    }

    return new Table(name, this.#database, sysObject.tablePage);
  }
}
