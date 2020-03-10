export default class Post {
  constructor(title, image) {
    this.title = title;
    this.date = new Date();
    this.image = image;
  }

  toString() {
    return JSON.stringify({
      title: this.title,
      date: this.date.toDateString(),
      image: this.image
    }, null, 2)
  }

  get uppercaseTitle() {
    return this.title.toUpperCase();
  }
}
