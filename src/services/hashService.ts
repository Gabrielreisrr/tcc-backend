import bcrypt from "bcrypt";

class HashService {
  private saltRounds: number;

  constructor(saltRounds: number = 10) {
    this.saltRounds = saltRounds;
  }

  async makeHash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async validateHash(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}

export default new HashService();
