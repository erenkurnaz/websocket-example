export abstract class Builder<Subject> {
  protected subject: Subject;

  protected constructor(subject: Subject) {
    this.subject = subject;
  }

  from(subject: Subject) {
    this.subject = { ...subject };
    return this;
  }

  with<K extends keyof Subject>(key: K, value: Subject[K]) {
    this.subject[key] = value;
    return this;
  }

  build(): Subject {
    return { ...this.subject };
  }
}
