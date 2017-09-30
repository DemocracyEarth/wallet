Feature: Solving issues
  In order to share how to reproduce an issue
  As a bug reporter
  I want to be able to describe that issue using failing scenarios


  Scenario: Issue #201 - Improve unicode support in slugs
    Given I am the citizen named Santa
      And I have proposed a votable idea titled "L'œuf de Noël !"
     When I go on the detail page of the idea titled "L'œuf de Noël !"
     Then I should be on the page "/vote/loeuf-de-noel"