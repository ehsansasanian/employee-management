#!/bin/bash


BASE_URL="http://localhost:8080/api"

add_department() {
    local name=$1
    curl -X POST -H "Content-Type: application/json" -d "{\"name\":\"$name\"}" "$BASE_URL/departments"
}

add_employee() {
    local firstname=$1
    local lastname=$2
    local email=$3
    local phone=$4
    local address=$5
    local departmentId=$6

    local data="{\"firstname\":\"$firstname\",\"lastname\":\"$lastname\",\"email\":\"$email\",\"phone\":\"$phone\",\"address\":\"$address\""
    if [ ! -z "$departmentId" ]; then
        data="$data,\"departmentId\":$departmentId"
    fi
    data="$data}"

    curl -X POST -H "Content-Type: application/json" -d "$data" "$BASE_URL/employees"
}


echo "Adding departments..."
add_department "Engineering"
add_department "Marketing"
add_department "Sales"
add_department "HR"
add_department "Finance"


echo "Adding employees..."

add_employee "John" "Doe" "john.doe@example.com" "1234567890" "123 Main St"
add_employee "Jane" "Smith" "jane.smith@example.com" "0987654321" "456 Oak St"
add_employee "Alice" "Johnson" "alice.johnson@example.com" "5551234567" "789 Pine St"
add_employee "Bob" "Brown" "bob.brown@example.com" "5559876543" "321 Elm St"
add_employee "Charlie" "Davis" "charlie.davis@example.com" "5554567890" "654 Maple St"


add_employee "David" "Wilson" "david.wilson@example.com" "5557890123" "987 Cedar St" 1
add_employee "Eva" "Martinez" "eva.martinez@example.com" "5552345678" "147 Birch St" 1
add_employee "Frank" "Garcia" "frank.garcia@example.com" "5553456789" "258 Spruce St" 2
add_employee "Grace" "Lee" "grace.lee@example.com" "5554567890" "369 Willow St" 2
add_employee "Hannah" "Taylor" "hannah.taylor@example.com" "5555678901" "741 Aspen St" 3
add_employee "Ian" "Anderson" "ian.anderson@example.com" "5556789012" "852 Redwood St" 3
add_employee "Jack" "Thomas" "jack.thomas@example.com" "5557890123" "963 Sequoia St" 4
add_employee "Kathy" "Jackson" "kathy.jackson@example.com" "5558901234" "159 Cypress St" 4
add_employee "Liam" "White" "liam.white@example.com" "5559012345" "357 Fir St" 5
add_employee "Mia" "Harris" "mia.harris@example.com" "5550123456" "468 Hemlock St" 5
add_employee "Noah" "Martin" "noah.martin@example.com" "5551234567" "579 Larch St" 1
add_employee "Olivia" "Thompson" "olivia.thompson@example.com" "5552345678" "680 Juniper St" 2
add_employee "Peter" "Moore" "peter.moore@example.com" "5553456789" "791 Cedar St" 3
add_employee "Quinn" "Clark" "quinn.clark@example.com" "5554567890" "802 Pine St" 4
add_employee "Rachel" "Lewis" "rachel.lewis@example.com" "5555678901" "913 Oak St" 5

echo "Script completed." 