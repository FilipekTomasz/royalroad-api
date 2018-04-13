import * as cheerio from 'cheerio';
import { Requester } from '../royalroad';

export interface NewChapter {
  title: string;
  content: string;
  preNote: undefined | string;
  postNote: undefined | string;
}

export interface Chapter {
  content: string;
  preNote: string;
  postNote: string;
  // comments: ChapterComment[];
}

export class ChapterService {
  private readonly req: Requester;

  constructor(req: Requester) {
    this.req = req;
  }

  /**
   * Add a chapter to a given fiction.
   *
   * @param fictionID - ID of the fiction to publish a chapter for.
   * @param chapter - Object describing the chapter.
   */
  public async publish(fictionID: number, chapter: NewChapter) {
    const body = await this.req.post(
      `/fiction/chapter/new/${String(fictionID)}`,
      {
        Status: 'New',
        fid: fictionID,
        Title: chapter.title,
        PreAuthorNotes: chapter.preNote,
        Content: chapter.content,
        PostAuthorNotes: chapter.postNote,
        action: 'publish',
      },
      true,
    );

    return body;
  }

  public async getChapter(
    fictionID: number,
    fictionName: string,
    chapterID: number,
    chapterName: string,
  ) {

    const ficName = fictionName.toLowerCase().replace(/\s/, '-');
    const body = await this.req.get(
      `/fiction/${String(fictionID)}/${ficName}`
      + `/chapter/${String(chapterID)}/${chapterName}`,
    );

    return ChapterParser.parseChapter(body);
  }
}

export class ChapterParser {
  public static parseChapter(html: string): Chapter {
    const $ = cheerio.load(html);

    const notes = $('div.author-note');
    const preNote = $(notes).eq(0).find('p').text();
    const postNote = $(notes).eq(1).find('p').text();

    let content: string = '';

    $('div.chapter-content').find('p').each((i, el) => {
      content += $(el).text() + '\n';
    });

    return { content, preNote, postNote };
  }
}
