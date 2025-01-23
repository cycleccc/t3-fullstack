export const headerMapping = {
    id: "索引ID",
    paramCount: "参数数量",
    contentCn: "内容_简体",
    remark: "备注",
    contentTw: "内容_繁体",
    contentEn: "内容_英语",
    contentJa: "内容_日语",
    contentKo: "内容_韩语",
    contentVi: "内容_越南",
    contentRu: "内容_俄语",
    contentIt: "内容_意语",
    contentEs: "内容_西语",
    contentPt: "内容_葡语",
    contentFr: "内容_法语",
    contentAr: "内容_阿拉伯语",
    contentDe: "内容_德语",
    contentTh: "内容_泰语",
    contentId: "内容_印尼",
    contentTr: "内容_土耳其",
    contentSeaEn: "内容_东南亚英语",
};
export const headerOrder = [
    "索引ID",
    "参数数量",
    "内容_简体",
    "备注",
    "内容_繁体",
    "内容_英语",
    "内容_日语",
    "内容_韩语",
    "内容_越南",
    "内容_俄语",
    "内容_意语",
    "内容_西语",
    "内容_葡语",
    "内容_法语",
    "内容_阿拉伯语",
    "内容_德语",
    "内容_泰语",
    "内容_印尼",
    "内容_土耳其",
    "内容_东南亚英语",
];

export const languages = [
    { key: "contentTw", title: "内容_繁体" },
    { key: "contentEn", title: "内容_英文" },
    { key: "contentJa", title: "内容_日语" },
    { key: "contentKo", title: "内容_韩语" },
    { key: "contentVi", title: "内容_越南语" },
    { key: "contentRu", title: "内容_俄语" },
    { key: "contentIt", title: "内容_意大利语" },
    { key: "contentEs", title: "内容_西班牙语" },
    { key: "contentPt", title: "内容_葡萄牙语" },
    { key: "contentFr", title: "内容_法语" },
    { key: "contentAr", title: "内容_阿拉伯语" },
    { key: "contentDe", title: "内容_德语" },
    { key: "contentTh", title: "内容_泰语" },
    { key: "contentId", title: "内容_印度尼西亚语" },
    { key: "contentTr", title: "内容_土耳其语" },
    { key: "contentSeaEn", title: "内容_东南亚英语" },
];

export const options = languages.reduce((acc, cur) => {
   acc[cur.key] = { show: false };
   return acc;
}, {} as Record<string, { show: boolean }>);

export const translationColumns = languages.map((lang) => ({
    title: lang.title, // 表头名称
    dataIndex: lang.key, // 对应数据字段名
    ellipsis: true,
    search:false,
}));