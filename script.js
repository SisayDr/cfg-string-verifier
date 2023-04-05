var given_production_rule;
var variables = [];
var productions = [];

var start_symbol;
var given_string;
var match_found = false;
var exit_status;
var derived_strings = []; //to avoid infinite loops keep record of string already derived
var derivation_steps = [];
var results_table_body = document.querySelector("#results-table-body");
var derivation_end_conditions = [
  "The given String was successfully derived from the given production rule",
  "The number of terminals reached to the size of the given string. Hence, waiting for epsilon...",
  "The derivation process was about to enter a possible infinte loop. Hence stoped derivation.",
  "The number of variables exceded the maximum limit. Meaning, possible infine loop ahead. Hence, stop derivation.",
  "The number of terminals reached to the size of the given string, but the production rule does not include epsilon",
  "The number of terminals exceded the maximum length",
  "There is no variable to replace but the derived string is still not the same as the given string",
  "The derived string's left most terminals do not match with the left most terminals of the given string",
];
function clear_variables() {
  given_production_rule = "";
  derivation_steps = [];
  variables = [];
  productions = [];
  start_symbol = "";
  given_string = "";
  match_found = false;
  exit_status = "";
  derived_strings = [];
  derivation_steps = [];
}
function clear_tables() {
  document.querySelector("#rules-table-body").innerHTML = "";
  document.querySelector("#variables-table-body").innerHTML = "";
  document.querySelector("#results-table-body").innerHTML = "";
  document.querySelector("#result").innerHTML = "";
  derivation_steps = [];
}
function test_if_string_match() {
  clear_tables();
  clear_variables();
  //accept inputs
  given_production_rule = document
    .querySelector("#production-rule-input")
    .value.trim();
  given_string = document.querySelector("#test-string-input").value.trim();
  start_symbol = document.querySelector("#start-symbol-input").value.trim();

  //store variables and productions on different arrays
  rules = given_production_rule.split(",");
  for (i = 0; i < rules.length; i++) {
    variables[i] = rules[i].split("->")[0];
    productions[i] = rules[i].split("->")[1].split("|");
  }

  //display on html page
  variables.forEach((variable) => {
    document.querySelector("#variables-table-body").innerHTML +=
      "<tr><td>" + variable + "</td></tr>";
  });
  rules.forEach((rule) => {
    document.querySelector("#rules-table-body").innerHTML +=
      "<tr><td>" +
      rule.replace("->", " &rarr; ").replace("^", "&epsilon;") +
      "</td></tr>";
  });

  productions.forEach((production) => {
    production.sort().reverse();
  });
  let string_is_match = derivate(start_symbol); //remove repeated steps

  let start_index = 0;
  for (let i = 0; i < derivation_steps.length; i++) {
    if (derivation_steps[i][0] == start_symbol) {
      start_index = i;
    }
  }

  derivation_steps = derivation_steps.slice(start_index);

  if (string_is_match) {
    document.querySelector("#result").style.color = "green";
    document.querySelector("#result").innerHTML +=
      "&check; String &ldquo;" +
      given_string +
      "&rdquo;  is a Match! (" +
      derivation_steps.length +
      ' derivation stetps) &emsp;&emsp;<button onclick="view_derivation(this)">See Derivation</button>';
  } else {
    document.querySelector("#result").style.color = "red";
    document.querySelector("#result").innerHTML +=
      "&times; String &ldquo;" +
      given_string +
      "&rdquo; is not a Match! (" +
      derivation_steps.length +
      ' derivation stetps tried) &emsp;&emsp;<button onclick="view_derivation(this)">See Derivation</button>';
  }

  return false;
}
function get_variable_index(produced_string) {
  let index = -1;
  for (let i = 0; i < produced_string.length; i++) {
    if (variables.includes(produced_string[i])) {
      index = i;
      break;
    }
  }
  return index;
}
function count_terminals(current_string) {
  let count_terminals = 0;
  for (let i = 0; i < current_string.length; i++) {
    if (!variables.includes(current_string[i])) count_terminals++;
  }
  return count_terminals;
}
function count_variables(current_string) {
  let count_variables = 0;
  for (let i = 0; i < current_string.length; i++) {
    if (variables.includes(current_string[i])) count_variables++;
  }
  return count_variables;
}
function max_variables_allowed(variable_rules) {
  let max_terminals = 0;
  for (let i = 0; i < variable_rules.length; i++) {
    if (count_terminals(variable_rules[i]) > max_terminals) {
      max_terminals = count_terminals(variable_rules[i]);
    }
  }
  return Math.round(given_string.length / max_terminals);
}
function derivate(produced_string) {
  let index = get_variable_index(produced_string);
  let current_variable = produced_string[index];
  let current_variable_rules = productions[variables.indexOf(current_variable)];
  let derived_string;

  let i = -1;
  while (!match_found && i < current_variable_rules.length - 1) {
    i++;
    //if number of terminals in the derived string are equal to the length of the given string wait until epslone is found
    //if(count_terminals(produced_string) == given_string.length && current_variable_rules.includes("^") && current_variable_rules[i] != "^"){exit_status = 1; continue;};
    let derived_string = produced_string
      .replace(current_variable, current_variable_rules[i])
      .replace("^", "");
    let rule = current_variable + " -> " + current_variable_rules[i];
    let new_index = get_variable_index(derived_string);
    //if match string is found return true and abort
    if (derived_string == given_string) {
      exit_status = 0;
      match_found = true;
      derivation_steps.push([produced_string, rule, derived_string]);
    }
    //if already been found previously
    else if (derived_strings.includes(derived_string)) {
      exit_status = 2;
      continue;
    } else if (
      count_variables(derived_string) >
      max_variables_allowed(current_variable_rules)
    ) {
      exit_status = 3;
      continue;
    }
    //if number of terminals equals to length of given string and there is no epslone in the production rule stop deriving on that brunch
    //else if(count_terminals(derived_string) == given_string.length && !current_variable_rules.includes("^")){exit_status = 4; continue;}
    //if no variable is left in the derived string & it is not equal to the given string
    else if (new_index == -1) {
      exit_status = 5;
      continue;
    }
    //if the number of terminals is greater than the length of the given string stop, strings after this are completely different from the given one.
    else if (count_terminals(derived_string) > given_string.length) {
      exit_status = 6;
      continue;
    }
    //if the produced string's left most terminals don't match, a diferent string is being created so  stop deriving on that brunch
    else if (
      derived_string.substr(0, new_index) != given_string.substr(0, new_index)
    ) {
      exit_status = 7;
      continue;
    } else {
      derivation_steps.push([produced_string, rule, derived_string]);
      derived_strings.push(derived_string);
      derivate(derived_string);
    }
  }
  return match_found;
}
function view_derivation(btn) {
  btn.remove();
  derivation_steps.forEach((step) => {
    results_table_body.innerHTML +=
      "<tr>" +
      "<td>" +
      step[0] +
      "</td>" +
      "<td>" +
      step[1].replace("->", " &rarr; ").replace("^", " &epsilon; ") +
      "</td>" +
      "<td>" +
      step[2] +
      "</td>" +
      "</tr>";
    window.scrollTo(0, document.body.scrollHeight);
  });
}
