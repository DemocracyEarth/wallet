Medialab Prado 23/11

# Votes allocations in the long run, Satoshi Nakamoto's way (wip)

Some of the system design behind our first release of Sovereign is directly inspired by the Satoshi Nakamoto's economics of Bitcoin. One example is vote scarcity, when a collective start its collective it can parameter the number of votes allocated to each user when they signup. Votes are not tied to a particular proposal and a user can cast more than one vote on them (intensity voting).

In such condition members of the collective not only have to position themselves according to the proposal but also be smart on how they allocate their voting resources. (Game theory, cost opportunity).

As we've been intensively experimenting this week in this particular environment, really interesting member behaviors have emerged and the feeling we have is that this setting makes voting much more interesting and dynamic for the users as it becomes more complex (not binary).

![unlocking vote potential](https://lh3.googleusercontent.com/u6_MifPj4nfaRUq_JL6mglTDA3x-JUTnOjEfiRZdTyTUZ7z09Kbn8aNPwo5RsViSIHF-o2z84add=w1640-h950-no)

The problem with this is that it doesn't work in the long run because people will eventually run out of votes. We've been thinking of ways to allocate new votes :

- New votes are issued as new proposals are created
- New votes are issued periodically (d/w/m/y)

We even starting doubting about users being able to allocate multiple votes on a single ballot. At one point we started thinking, "why don't we fully embrace Satoshi Nakomoto's design principles of Bitcoin for our governance system". And that's how we think we might have cracked it, here is how.

Bitcoin economics are very simple, it's basically the same as gold extraction. There is finite amount of gold on earth and to benefit from it you have to extract it form the soil mining. There is a finite amount of Bitcoins and to new ones, miners have to solve complex cryptographic problems using computational power. A number of Bitcoins (plus transaction fees) (12,5 BTC currently, halves every four years) are allocated for them miners who solve the complex cryptographic problem and brings consensus to the rest to the networks allowing for a new block to be created and linked to the rest of the chain. One particular thing that is interesting with the Bitcoin protocol is that the complexity of cryptographic problem complexity it gives to the miner is bound to the numbers of computers competing to solve it, so if less people mine Bitcoin it will give easier problems to solve to make Bitcoin mining interesting again and vice versa.

## So how can we apply this to Sovereign's votes allocation system?

- When a collective creates an instance a finite number of votes are available in the system, votes are thus made a scarce resource that has to be used carefully by the users.

- Just like with Bitcoin new votes are created when a problem is solved, hence a decision is made, consensus is reached.

- When vote get scarce more consensual proposals can be made by members of the group so proposals can be approved more easily, leading to the creation of new votes (forcing the group to come together on smaller issues to later tackle more controversial ones). It also means that people have to solve problems before they create new one.

- The limited number of votes in the system guarantees that members don't abuse (overuse) this easy vote creation features. This scarcity aspect could be reinforced by halving the quantity of votes created every x period of time (**vote halving**) just like with Bitcoin.


PS : I'm dying to know what would Satoshi think of this. ;)

PR welcome

**Votable** --> https://sovereign.opensourcepolitics.eu/vote/votes-allocations-in-the-long-run-for-sovereign-satoshi-nakamotos-way
