<?php

class Validator
{
    private $errors = [];

    public function validate($data, $rules)
    {
        $this->errors = [];

        foreach ($rules as $field => $ruleSet) {
            $rulesArray = explode('|', $ruleSet);
            $value = $data[$field] ?? null;

            foreach ($rulesArray as $rule) {
                $this->applyRule($field, $value, $rule, $data);
            }
        }

        if (!empty($this->errors)) {
            Response::validationError($this->errors);
        }

        return true;
    }

    private function applyRule($field, $value, $rule, $allData)
    {
        if (strpos($rule, ':') !== false) {
            [$ruleName, $ruleValue] = explode(':', $rule, 2);
        } else {
            $ruleName = $rule;
            $ruleValue = null;
        }

        switch ($ruleName) {
            case 'required':
                if ($value === null || $value === '') {
                    $this->errors[$field][] = "The $field field is required.";
                }
                break;

            case 'email':
                if ($value && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $this->errors[$field][] = "The $field must be a valid email address.";
                }
                break;

            case 'min':
                if ($value && strlen($value) < $ruleValue) {
                    $this->errors[$field][] = "The $field must be at least $ruleValue characters.";
                }
                break;

            case 'max':
                if ($value && strlen($value) > $ruleValue) {
                    $this->errors[$field][] = "The $field must not exceed $ruleValue characters.";
                }
                break;

            case 'integer':
                if ($value !== null && !filter_var($value, FILTER_VALIDATE_INT)) {
                    $this->errors[$field][] = "The $field must be an integer.";
                }
                break;

            case 'numeric':
                if ($value !== null && !is_numeric($value)) {
                    $this->errors[$field][] = "The $field must be a number.";
                }
                break;

            case 'string':
                if ($value !== null && !is_string($value)) {
                    $this->errors[$field][] = "The $field must be a string.";
                }
                break;

            case 'array':
                if ($value !== null && !is_array($value)) {
                    $this->errors[$field][] = "The $field must be an array.";
                }
                break;

            case 'in':
                $allowedValues = explode(',', $ruleValue);
                if ($value && !in_array($value, $allowedValues)) {
                    $this->errors[$field][] = "The $field must be one of: " . implode(', ', $allowedValues);
                }
                break;

            case 'unique':
                list($table, $column) = explode(',', $ruleValue);
                $db = Database::getInstance();
                $existing = $db->fetch("SELECT id FROM $table WHERE $column = ? LIMIT 1", [$value]);
                if ($existing) {
                    $this->errors[$field][] = "The $field has already been taken.";
                }
                break;

            case 'exists':
                list($table, $column) = explode(',', $ruleValue);
                $db = Database::getInstance();
                $existing = $db->fetch("SELECT id FROM $table WHERE $column = ? LIMIT 1", [$value]);
                if (!$existing) {
                    $this->errors[$field][] = "The selected $field is invalid.";
                }
                break;

            case 'confirmed':
                if ($value !== ($allData[$field . '_confirmation'] ?? null)) {
                    $this->errors[$field][] = "The $field confirmation does not match.";
                }
                break;

            case 'regex':
                if ($value && !preg_match($ruleValue, $value)) {
                    $this->errors[$field][] = "The $field format is invalid.";
                }
                break;

            case 'nullable':
                // Skip validation if value is null
                break;
        }
    }

    public function getErrors()
    {
        return $this->errors;
    }
}
