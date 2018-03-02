import { IframesPage } from './app.po';

describe('iframes App', () => {
  let page: IframesPage;

  beforeEach(() => {
    page = new IframesPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
