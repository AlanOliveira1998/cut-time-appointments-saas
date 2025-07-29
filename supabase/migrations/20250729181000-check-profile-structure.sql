-- Verificar a estrutura da tabela profiles
SELECT 
    c.column_name, 
    c.data_type, 
    c.is_nullable, 
    c.column_default,
    c.character_maximum_length,
    pgd.description
FROM 
    information_schema.columns c
LEFT JOIN 
    pg_catalog.pg_statio_all_tables st ON (c.table_schema || '.' || c.table_name)::regclass = st.relid
LEFT JOIN 
    pg_catalog.pg_description pgd ON (pgd.objoid, pgd.objsubid) = (st.relid, c.ordinal_position)
WHERE 
    c.table_name = 'profiles' 
    AND c.table_schema = 'public';

-- Verificar constraints da tabela
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints tc 
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    LEFT JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE 
    tc.table_name = 'profiles' 
    AND tc.table_schema = 'public';

-- Verificar índices da tabela
SELECT 
    i.relname AS index_name,
    a.attname AS column_name,
    ix.indisunique AS is_unique,
    ix.indisprimary AS is_primary_key
FROM 
    pg_class t,
    pg_class i,
    pg_index ix,
    pg_attribute a
WHERE 
    t.oid = ix.indrelid
    AND i.oid = ix.indexrelid
    AND a.attrelid = t.oid
    AND a.attnum = ANY(ix.indkey)
    AND t.relkind = 'r'
    AND t.relname = 'profiles'
ORDER BY 
    t.relname, i.relname;
