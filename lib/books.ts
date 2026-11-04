export type Testament = "old" | "new";

export interface Book {
  id: string;
  nameKo: string;
  testament: Testament;
  chapters: number;
}

// Protestant canon: 39 Old Testament + 27 New Testament books, in reading order.
// Chapter counts are a standard, uncopyrightable fact (not the Bible text itself).
export const BOOKS: Book[] = [
  { id: "genesis", nameKo: "창세기", testament: "old", chapters: 50 },
  { id: "exodus", nameKo: "출애굽기", testament: "old", chapters: 40 },
  { id: "leviticus", nameKo: "레위기", testament: "old", chapters: 27 },
  { id: "numbers", nameKo: "민수기", testament: "old", chapters: 36 },
  { id: "deuteronomy", nameKo: "신명기", testament: "old", chapters: 34 },
  { id: "joshua", nameKo: "여호수아", testament: "old", chapters: 24 },
  { id: "judges", nameKo: "사사기", testament: "old", chapters: 21 },
  { id: "ruth", nameKo: "룻기", testament: "old", chapters: 4 },
  { id: "1samuel", nameKo: "사무엘상", testament: "old", chapters: 31 },
  { id: "2samuel", nameKo: "사무엘하", testament: "old", chapters: 24 },
  { id: "1kings", nameKo: "열왕기상", testament: "old", chapters: 22 },
  { id: "2kings", nameKo: "열왕기하", testament: "old", chapters: 25 },
  { id: "1chronicles", nameKo: "역대상", testament: "old", chapters: 29 },
  { id: "2chronicles", nameKo: "역대하", testament: "old", chapters: 36 },
  { id: "ezra", nameKo: "에스라", testament: "old", chapters: 10 },
  { id: "nehemiah", nameKo: "느헤미야", testament: "old", chapters: 13 },
  { id: "esther", nameKo: "에스더", testament: "old", chapters: 10 },
  { id: "job", nameKo: "욥기", testament: "old", chapters: 42 },
  { id: "psalms", nameKo: "시편", testament: "old", chapters: 150 },
  { id: "proverbs", nameKo: "잠언", testament: "old", chapters: 31 },
  { id: "ecclesiastes", nameKo: "전도서", testament: "old", chapters: 12 },
  { id: "songofsongs", nameKo: "아가", testament: "old", chapters: 8 },
  { id: "isaiah", nameKo: "이사야", testament: "old", chapters: 66 },
  { id: "jeremiah", nameKo: "예레미야", testament: "old", chapters: 52 },
  { id: "lamentations", nameKo: "예레미야애가", testament: "old", chapters: 5 },
  { id: "ezekiel", nameKo: "에스겔", testament: "old", chapters: 48 },
  { id: "daniel", nameKo: "다니엘", testament: "old", chapters: 12 },
  { id: "hosea", nameKo: "호세아", testament: "old", chapters: 14 },
  { id: "joel", nameKo: "요엘", testament: "old", chapters: 3 },
  { id: "amos", nameKo: "아모스", testament: "old", chapters: 9 },
  { id: "obadiah", nameKo: "오바댜", testament: "old", chapters: 1 },
  { id: "jonah", nameKo: "요나", testament: "old", chapters: 4 },
  { id: "micah", nameKo: "미가", testament: "old", chapters: 7 },
  { id: "nahum", nameKo: "나훔", testament: "old", chapters: 3 },
  { id: "habakkuk", nameKo: "하박국", testament: "old", chapters: 3 },
  { id: "zephaniah", nameKo: "스바냐", testament: "old", chapters: 3 },
  { id: "haggai", nameKo: "학개", testament: "old", chapters: 2 },
  { id: "zechariah", nameKo: "스가랴", testament: "old", chapters: 14 },
  { id: "malachi", nameKo: "말라기", testament: "old", chapters: 4 },

  { id: "matthew", nameKo: "마태복음", testament: "new", chapters: 28 },
  { id: "mark", nameKo: "마가복음", testament: "new", chapters: 16 },
  { id: "luke", nameKo: "누가복음", testament: "new", chapters: 24 },
  { id: "john", nameKo: "요한복음", testament: "new", chapters: 21 },
  { id: "acts", nameKo: "사도행전", testament: "new", chapters: 28 },
  { id: "romans", nameKo: "로마서", testament: "new", chapters: 16 },
  { id: "1corinthians", nameKo: "고린도전서", testament: "new", chapters: 16 },
  { id: "2corinthians", nameKo: "고린도후서", testament: "new", chapters: 13 },
  { id: "galatians", nameKo: "갈라디아서", testament: "new", chapters: 6 },
  { id: "ephesians", nameKo: "에베소서", testament: "new", chapters: 6 },
  { id: "philippians", nameKo: "빌립보서", testament: "new", chapters: 4 },
  { id: "colossians", nameKo: "골로새서", testament: "new", chapters: 4 },
  { id: "1thessalonians", nameKo: "데살로니가전서", testament: "new", chapters: 5 },
  { id: "2thessalonians", nameKo: "데살로니가후서", testament: "new", chapters: 3 },
  { id: "1timothy", nameKo: "디모데전서", testament: "new", chapters: 6 },
  { id: "2timothy", nameKo: "디모데후서", testament: "new", chapters: 4 },
  { id: "titus", nameKo: "디도서", testament: "new", chapters: 3 },
  { id: "philemon", nameKo: "빌레몬서", testament: "new", chapters: 1 },
  { id: "hebrews", nameKo: "히브리서", testament: "new", chapters: 13 },
  { id: "james", nameKo: "야고보서", testament: "new", chapters: 5 },
  { id: "1peter", nameKo: "베드로전서", testament: "new", chapters: 5 },
  { id: "2peter", nameKo: "베드로후서", testament: "new", chapters: 3 },
  { id: "1john", nameKo: "요한일서", testament: "new", chapters: 5 },
  { id: "2john", nameKo: "요한이서", testament: "new", chapters: 1 },
  { id: "3john", nameKo: "요한삼서", testament: "new", chapters: 1 },
  { id: "jude", nameKo: "유다서", testament: "new", chapters: 1 },
  { id: "revelation", nameKo: "요한계시록", testament: "new", chapters: 22 },
];

export function findBook(id: string): Book | undefined {
  return BOOKS.find((b) => b.id === id);
}

export function booksOf(testament: Testament): Book[] {
  return BOOKS.filter((b) => b.testament === testament);
}
