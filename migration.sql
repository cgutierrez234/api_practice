DROP TABLE IF EXISTS magic_cards;

CREATE TABLE magic_cards (
    id serial PRIMARY KEY,
    type_of varchar(50), 
    name varchar(50),
    mana_cost int
)