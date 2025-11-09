import { createConverter } from "@mkizka/atdown-core";

export default createConverter({
  collection: "com.whtwnd.blog.entry",
  recordToMarkdown: (record) => {
    const { $type, content, ...rest } = record;
    if (!content || typeof content !== "string") {
      throw new Error("content field is required and must be a string");
    }
    return {
      content,
      metadata: rest,
    };
  },
  markdownToRecord: (markdown) => {
    return {
      $type: "com.whtwnd.blog.entry",
      content: markdown.content,
      ...markdown.metadata,
    };
  },
});
