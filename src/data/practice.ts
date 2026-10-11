/** Curated, reviewable v0.5 practice content. No learner code is executed in the browser. */
export type PracticeQuestion={id:string;prompt:string;choices:string[];correct:number;explanation:string};
export type PracticeLab={topicId:string;title:string;goal:string;concepts:string[];setup:string;starter:string;task:string;verify:string;questions:PracticeQuestion[]};

export const practiceLabs:Record<string,PracticeLab>={
  'python:0':{
    topicId:'python:0',title:'Your first reproducible Python AI workspace',
    goal:'Create a project that another developer can clone and run without depending on your global Python installation.',
    concepts:[
      'A virtual environment isolates packages for one project; committing the virtual environment is unnecessary.',
      'A lockfile records resolved dependencies so teammates install compatible versions.',
      'Secrets belong in environment variables and an ignored .env file, not in source code or Git history.'
    ],
    setup:'Install Python 3.11+ and uv (https://docs.astral.sh/uv/getting-started/installation/). Open a new empty folder.',
    starter:'uv init support-lab\ncd support-lab\nuv add httpx\nuv run python main.py',
    task:'Create a src or main.py function that accepts a support message and returns a JSON-friendly dictionary with text, length and whether the message includes the word “urgent” (case-insensitive). Add a test for an empty message and a mixed-case URGENT message. Commit pyproject.toml and uv.lock, not .venv.',
    verify:'Run `uv run python main.py` and `uv run python -m pytest` after installing pytest with `uv add --dev pytest`. In a fresh clone, `uv sync` must recreate the environment.',
    questions:[
      {id:'p0q1',prompt:'Which file should you commit to make dependency resolution reproducible with uv?',choices:['.venv/','uv.lock','Your system Python folder'],correct:1,explanation:'Commit uv.lock (and pyproject.toml); uv uses it to reproduce resolved dependency versions.'},
      {id:'p0q2',prompt:'Why avoid committing .env files with API credentials?',choices:['Python cannot read .env files','They can expose credentials in Git history','They prevent imports'],correct:1,explanation:'Even private repos can leak. Commit .env.example without values instead.'},
      {id:'p0q3',prompt:'What does `uv run python main.py` do?',choices:['Runs the project with uv-managed dependencies','Uploads Python code to the cloud','Globally upgrades Python'],correct:0,explanation:'uv run ensures the command executes in the project environment with its resolved dependencies.'}
    ]
  },
  'python:1':{
    topicId:'python:1',title:'Handle customer-support data safely',
    goal:'Convert untrusted JSON-like input into clean, predictable Python data structures.',
    concepts:[
      'Lists are mutable; strings, tuples and integers are immutable values.',
      'A dictionary lookup via .get avoids KeyError but does not guarantee the returned type.',
      'Validate external data at boundaries rather than relying on assumptions about API payloads.'
    ],
    setup:'Use an existing Python environment. Create `normalize_ticket.py` and `test_normalize_ticket.py`.',
    starter:'def normalize_ticket(payload: dict) -> dict:\n    raw = payload.get("message", "")\n    if not isinstance(raw, str):\n        raise ValueError("message must be a string")\n    tags = payload.get("tags", [])\n    if not isinstance(tags, list):\n        raise ValueError("tags must be a list")\n    return {"message": raw.strip(), "tags": tags.copy()}',
    task:'Extend normalize_ticket to reject non-string tags, remove duplicate tags case-insensitively without changing the original list, and return a normalized priority of "high" when the text contains "urgent", otherwise "normal".',
    verify:'Test an empty message, malformed tags, duplicate tags, and confirm mutating the result does not mutate the input payload.',
    questions:[
      {id:'p1q1',prompt:'Which Python type is mutable?',choices:['str','tuple','list'],correct:2,explanation:'Lists can be changed in place. Strings and tuples cannot.'},
      {id:'p1q2',prompt:'What does `payload.get("tags", [])` guarantee?',choices:['tags is always a list','Missing key returns an empty list','Tags contain unique strings'],correct:1,explanation:'.get handles missing keys only. Validate the type and contents separately.'},
      {id:'p1q3',prompt:'Why copy an input list before returning it?',choices:['To avoid accidental shared mutations','To increase network throughput','To make a tuple'],correct:0,explanation:'Without copying, the caller and your function may share references to the same mutable list.'}
    ]
  },
  'python:2':{
    topicId:'python:2',title:'Build testable functions and closures',
    goal:'Refactor a support-message analyzer into small, independently testable functions.',
    concepts:[
      'Prefer pure functions for transformations: identical input should produce identical output.',
      'Closures capture variables from outer functions, which is useful for reusable validators.',
      'Avoid mutable default arguments, because the same object is reused across calls.'
    ],
    setup:'Create `pipeline.py` and `test_pipeline.py` in your Python project.',
    starter:'def make_min_length_validator(min_length: int):\n    def is_valid(message: str) -> bool:\n        return len(message.strip()) >= min_length\n    return is_valid\n\nvalidate = make_min_length_validator(8)\nprint(validate("Help me"))',
    task:'Implement classify_priority(message: str) and make_min_length_validator(n). Write a process_ticket(message, validator) function that uses dependency injection and returns the priority or raises ValueError for invalid input.',
    verify:'Write unit tests for boundary lengths, mixed-case priority phrases and two validators with different length limits. Avoid depending on global state.',
    questions:[
      {id:'p2q1',prompt:'What is a closure?',choices:['A function that retains access to its enclosing variables','A class with a destructor','A function without a return statement'],correct:0,explanation:'The inner function keeps access to min_length even after the outer function returns.'},
      {id:'p2q2',prompt:'Why prefer a pure transformation function?',choices:['It automatically runs faster','It is easier to reason about and test','It cannot raise errors'],correct:1,explanation:'Pure functions are predictable and avoid hidden mutations and side effects.'},
      {id:'p2q3',prompt:'Which parameter default avoids shared mutable state?',choices:['def f(tags=[]):','def f(tags=None):','def f(tags={}):'],correct:1,explanation:'Use None as a sentinel and create a fresh list inside the function.'}
    ]
  },
  'python:3':{
    topicId:'python:3',title:'Process batches with comprehensions and iterators',
    goal:'Turn a list of raw support tickets into a clean stream of high-priority tickets.',
    concepts:[
      'A comprehension is ideal for small, readable transformations of finite collections.',
      'An iterator yields items as requested rather than materializing every intermediate result.',
      'Generator expressions are consumed after iteration; recreate them when you need another pass.'
    ],
    setup:'Create `ticket_stream.py` and use a small list of ticket dictionaries for input.',
    starter:'tickets = [\n    {"id": 1, "priority": "high", "message": "urgent outage"},\n    {"id": 2, "priority": "normal", "message": "status update"},\n]\nhigh_ids = [t["id"] for t in tickets if t["priority"] == "high"]\nprint(high_ids)',
    task:'Write a generator high_priority_tickets(tickets) that yields validated high-priority records. Handle missing priority fields gracefully. Demonstrate processing the first result without building a second list, and compare it with a list-comprehension version.',
    verify:'Test an empty batch, missing fields, duplicate IDs, and that the generator does not run your processing body until iteration begins.',
    questions:[
      {id:'p3q1',prompt:'What does a generator expression return?',choices:['A list containing all results','An iterator that produces values on demand','A sorted tuple'],correct:1,explanation:'Generators evaluate lazily as consumers request items.'},
      {id:'p3q2',prompt:'Which pattern is generally clearest for a short transformation over a small list?',choices:['A list comprehension','Manually invoking __next__ everywhere','Using eval'],correct:0,explanation:'Simple comprehensions improve readability, but complex logic belongs in named functions.'},
      {id:'p3q3',prompt:'What happens after a generator is completely exhausted?',choices:['It restarts automatically','It yields nothing more','It duplicates its items'],correct:1,explanation:'Generators are one-pass iterators; create a new one to iterate again.'}
    ]
  }
};