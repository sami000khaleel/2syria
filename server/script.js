import { createClient } from '@clickhouse/client'

const client = createClient({
  url: 'https://lr7sykrg7m.germanywestcentral.azure.clickhouse.cloud:8443',
  username: 'default',
  password: 'W7qnF~y.E~zGb',
  database: 'TeachMe',
})

const tables = {
  teacher: `
    CREATE TABLE IF NOT EXISTS teacher (
      id_teacher Int32,
      first_name String,
      last_name String,
      password String,
      email String
    ) ENGINE = MergeTree()
    ORDER BY id_teacher
  `,

  student: `
    CREATE TABLE IF NOT EXISTS student (
      id_stu Int32,
      first_name_stu String,
      last_name_stu String,
      password String,
      email_stu String,
      image_url Nullable(String)
    ) ENGINE = MergeTree()
    ORDER BY id_stu
  `,

  cours: `
    CREATE TABLE IF NOT EXISTS cours (
      id_cours Int32,
      cours_name String,
      cours_discription Nullable(String),
      first_cours Nullable(Date),
      end_cours Nullable(Date),
      date1 Nullable(String),
      date2 Nullable(String),
      hours Nullable(Int32)
    ) ENGINE = MergeTree()
    ORDER BY id_cours
  `,

  code: `
    CREATE TABLE IF NOT EXISTS code (
      idcode Int32,
      code Nullable(String),
      codeDate Nullable(Date)
    ) ENGINE = MergeTree()
    ORDER BY idcode
  `,

  relater: `
    CREATE TABLE IF NOT EXISTS relater (
      id_relater Int32,
      id_stu Nullable(Int32),
      id_teacher Nullable(Int32),
      id_cours Nullable(Int32)
    ) ENGINE = MergeTree()
    ORDER BY id_relater
  `,

  relater2: `
    CREATE TABLE IF NOT EXISTS relater2 (
      idrelater2 Int32,
      id_stu Nullable(Int32),
      id_teacher Nullable(Int32),
      id_code Nullable(Int32)
    ) ENGINE = MergeTree()
    ORDER BY idrelater2
  `,

  lectures: `
    CREATE TABLE IF NOT EXISTS lectures (
      id_lecture Int32,
      lecture Nullable(String),
      id_course Nullable(Int32)
    ) ENGINE = MergeTree()
    ORDER BY id_lecture
  `,
}

void (async () => {
  for (const [name, ddl] of Object.entries(tables)) {
    try {
      await client.command({ query: ddl })
      console.log(`created ${name}`)
    } catch (err) {
      console.error(`failed ${name}: ${err.message}`)
      process.exit(1)
    }
  }

  // Recreate the view (DROP first so re-runs are safe)
  const viewSql = `
    CREATE OR REPLACE VIEW cours_view AS
    SELECT
      r.id_relater AS id_relater,
      s.first_name_stu AS first_name_stu,
      s.last_name_stu AS last_name_stu,
      c.id_cours AS id_cours,
      c.cours_name AS cours_name,
      c.first_cours AS first_cours,
      c.end_cours AS end_cours,
      c.date1 AS date1,
      c.date2 AS date2,
      t.first_name AS name_teacher
    FROM relater r
    LEFT JOIN student s ON r.id_stu = s.id_stu
    LEFT JOIN cours c ON r.id_cours = c.id_cours
    LEFT JOIN teacher t ON r.id_teacher = t.id_teacher
  `

  try {
    await client.command({ query: viewSql })
    console.log('created cours_view')
  } catch (err) {
    console.error(`failed cours_view: ${err.message}`)
    process.exit(1)
  }

  await client.close()
  console.log('done')
})()
