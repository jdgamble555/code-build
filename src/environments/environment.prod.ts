export const environment = {
  production: true,
  supabase_url: process.env["SUPABASE_URL"] as string,
  supabase_key: process.env["SUPABASE_KEY"] as string,
  title: 'Code.Build',
  domain: 'code.build',
  description: 'A blog about Databases, Searching, Indexing, Programming, Security, Hosting, and Other Website Technologies!',
  short_desc: 'An easier way to code your web applications !',
  site: "https://code.build",
  storage: 'code-build',
  author: 'Jonathan Gamble',
  icon: 'code',
  icon_class: 'ng-dark-blue',
  icon_dark_class: 'ng-blue',
  back: 'ng-black-back'
};
