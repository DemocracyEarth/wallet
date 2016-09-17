//institutional
ORGANIZATION_NAME = Meteor.settings.public.Collective.name;
ORGANIZATION_ID = Meteor.settings.public.Collective._id;

//text
$LANGUAGE = "en"; //language of the app

//rules
TITLE_MAX_LENGTH = 100; //length of contract titles
MAX_TAGS_PER_CONTRACT = 3; //max amount of tags per contract
MIN_TAGS_PER_CONTRACT = 1; //min amount.
MAX_PROFILE_NAME_LENGTH = 20; //Maximum extension of profile name
VOTES_INITIAL_QUANTITY = 100; //initial votes for genesis transaction event

//timers
SERVER_INTERVAL = 2500;  //time in ms to communicate with server for contenteditable stuff.
ANIMATION_DURATION = 250; //pace of animations
WARNING_DURATION = 5000; //duration of warning messages

//classes
OFFSCREEN_CLASS = 'off-screen';

//key strings
CURRENCY_BITCOIN = 'BITCOIN';
CURRENCY_SATOSHI = 'SATOSHI';
CURRENCY_VOTES = 'VOTES';
ENTITY_INDIVIDUAL = 'INDIVIDUAL';
ENTITY_COLLECTIVE = 'COLLECTIVE';
ENTITY_UNKNOWN = 'UNKNOWN';
KIND_VOTE = 'VOTE';
KIND_DELEGATION = 'DELEGATION';
KIND_MEMBERSHIP = 'MEMBERSHIP';
KIND_UNKNOWN = 'UNKNOWN';
STATUS_PENDING = 'PENDING';
STATUS_REJECTED = 'REJECTED';
STATUS_CONFIRMED = 'CONFIRMED';
ROLE_DELEGATOR = 'DELEGATOR';
ROLE_DELEGATE = 'DELEGATE';
STAGE_DRAFT = 'DRAFT';
