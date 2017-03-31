import { TrekEngineClientPage } from './app.po';

describe('trek-engine-client App', () => {
  let page: TrekEngineClientPage;

  beforeEach(() => {
    page = new TrekEngineClientPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
