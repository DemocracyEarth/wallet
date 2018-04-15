Feature: Signup/signin as a citizen
  In order to share knowledge and initiate legal updates
  As a citizen
  I need to be able to signup and signin and to edit my profile

  Background:
    Given I am on the homepage

  Scenario: A user can register and login
    When I click in the user loggin button
    And I click in the sign up link
    And I register with some name, password and email
    Then I should be registered
    And I should be logged in
    When I sign out
    When I enter incorrect authentication information
    Then I should see a user not found error
    And I enter my email and password
    Then I should be logged in
    When I click in the user loggin button
    Then I can edit my profile
