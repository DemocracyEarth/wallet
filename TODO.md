# Testing
## Test
- [ ] 1) write tests  
- [ ] 2) circleCi integration(or any other Continuous Integration platform)  
- [ ] 3) define help process  
- [ ] 4) write help guide (**wiki**)  

## Ejecución Local (para colaboradores)
- [ ] 1) load DB script for test and fix purpose  
- [ ] 2) best practices docs (**wiki**) 

# Implementación 
- [ ] 1) scripts: db generation and collections  
- [ ] 2) implementation docs: setup, how to, step by step guide (**wiki**) 
- [ ] 3) user docs (**wiki**) 

# Varios
## Best Practices
- [ ] 1) new staging environment to QA, with own metrics and data: google analytics, kadira  
- [ ] 2) rewrite config files with dynamic values (process.ENV):
``` js
    mongodb:{
        uri: process.env.MONGO_URI || 'localhost',
        port: process.env.MONGO_PORT || 2701,
        db: process.env.MONGO_DB || 'wykiwyg'
    }
```

## DB
- [ ] 1) split contracts in:  
    - voters_campaing_name: users wallet  
    - delegations_campaing_name  
    - votes_campaing_name  
- [ ] 2) delete flags with false values: information overload  
- [ ] 3) move recurrent values from db to `Client` instance. Example: html content in field description in contracts collection move to client as switch case.  