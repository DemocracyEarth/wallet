Feature: Proposing ideas
  In order to share knowledge and initiate legal updates
  As a citizen
  I need to be able to propose ideas

  Background:
    Given I am the citizen named Richard S.
      And there is a tag titled Transparency

  Scenario: Propose a fully qualified idea successfully
    Given there should not be an idea titled "Require libre software in all governmental endeavours."
     When I am on the homepage
      And I trigger the floating action button
     Then I should be on the page to propose an idea

#      Note: There is no actual form in the page, just a bunch of contenteditable divs
#      And I should see the form to propose an idea

#      The id is "titleContent" WTF?!
     When I fill the idea title with "Require libre software in all governmental endeavours."


#      The id is "editor" WTF!!!
      And I fill the idea description with "Otherwise, I will draw my katanas."

      And I pause for 10s

#      And I add the tag Transparency
#      And I sign the idea
#      And I trigger the button to open the vote
#      And I submit the idea
#     Then there should be an idea titled "Require libre software in all governmental endeavours."
#      And ...
