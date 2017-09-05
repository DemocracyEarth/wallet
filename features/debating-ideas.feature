Feature: Debating on ideas
  Dans le but de faire avancer le schmilblick
  As a citizen
  I need to be able to debate on ideas


  Background:
    Given I am the citizen named Ali
      And there is a citizen named Bob
      And there is a citizen named Cho
      And Bob has proposed a votable idea titled "Bob's Idea"


  Scenario: Comment on someone else's idea
     When I go on the detail page of the idea titled "Bob's Idea"
     Then I should be on the page /vote/bobs-idea
     When I comment on the idea with "First!"
      And I reload the page
     Then I should see "First!" in the page
     When I comment on the idea with "Second!"
      And I reload the page
     Then I should see "Second!" in the page
     When I log in as Cho
      And I reload the page
     When I comment on the idea with "Third!"
     Then I should see "Third!" in the page
     Then I should see "Cho" in the page
     When I reply to the comment "First!" with "Child!"
     When I reply to the comment "Second!" with "Child!"
     Then I should see "Child!" two times in the page
     #Then I dump the comment tree of the idea titled "Bob's Idea"
     Then the comment tree of the idea titled "Bob's Idea" should look like :
"""
- content: "First!"
  children:
    - content: "Child!"
- content: "Second!"
  children:
    - content: "Child!"
- content: "Third!"
"""


  # Ideas to debate
  Scenario: Fail to comment more than a hundred times per hour (papy mougeot!)
  Scenario: Fail to comment when banned, blocked, etc.
  Scenario: Fail to comment when not logged in
  Scenario: ...