create table if not exists Users (
    id serial primary key not null,
    email text not null,
    name text not null,
    unique (email)
);

create table if not exists Messages (
  id serial primary key not null,
  user_id int not null references Users(id),
  message text not null
);