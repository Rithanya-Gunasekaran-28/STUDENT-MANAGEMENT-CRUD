
const API_URL = "/api/students";

const studentForm = document.getElementById("studentForm");
const studentTableBody = document.getElementById("studentTableBody");
const searchInput = document.getElementById("searchInput");

let editingStudentId = null;
let students = [];

// READ - Fetch and display students
async function fetchStudents() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Unable to fetch students");

        students = await response.json();
        displayStudents(students);
        updateStatistics();

    } catch (error) {
        console.error(error);
        studentTableBody.innerHTML =
            '<tr><td colspan="7" class="empty-message">Unable to load student records.</td></tr>';
    }
}

// Display students in the table
function displayStudents(data) {
    if (data.length === 0) {
        studentTableBody.innerHTML =
            '<tr><td colspan="7" class="empty-message">No student records found.</td></tr>';
        return;
    }

    studentTableBody.innerHTML = data.map(student => `
        <tr>
            <td>${escapeHTML(student.name)}</td>
            <td>${escapeHTML(student.registerNumber)}</td>
            <td>${escapeHTML(student.department)}</td>
            <td>${escapeHTML(student.year)}</td>
            <td>${escapeHTML(student.email)}</td>
            <td>${escapeHTML(student.phone)}</td>
            <td>
                <button class="edit-btn" onclick="editStudent('${student._id}')">Edit</button>
                <button class="delete-btn" onclick="deleteStudent('${student._id}')">Delete</button>
            </td>
        </tr>
    `).join("");
}

// Safely display user-entered text
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// CREATE - Add a student
studentForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const studentData = {
        name: document.getElementById("name").value.trim(),
        registerNumber: document.getElementById("registerNumber").value.trim(),
        department: document.getElementById("department").value,
        year: document.getElementById("year").value,
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim()
    };

    try {
        const url = editingStudentId
            ? `${API_URL}/${editingStudentId}`
            : API_URL;

        const method = editingStudentId ? "PUT" : "POST";

        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(studentData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Operation failed");
        }

        alert(editingStudentId
            ? "Student updated successfully!"
            : "Student added successfully!");

        resetForm();
        await fetchStudents();

    } catch (error) {
        alert(error.message);
    }
});

// UPDATE - Load student details into form
function editStudent(id) {
    const student = students.find(item => item._id === id);

    if (!student) return;

    editingStudentId = id;

    document.getElementById("name").value = student.name;
    document.getElementById("registerNumber").value = student.registerNumber;
    document.getElementById("department").value = student.department;
    document.getElementById("year").value = student.year;
    document.getElementById("email").value = student.email;
    document.getElementById("phone").value = student.phone;

    document.getElementById("formTitle").textContent = "Edit Student Details";
    document.getElementById("submitBtn").textContent = "Update Student";

    document.getElementById("student-form").scrollIntoView({
        behavior: "smooth"
    });
}

// DELETE - Remove student
async function deleteStudent(id) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Delete failed");
        }

        alert("Student deleted successfully!");
        await fetchStudents();

    } catch (error) {
        alert(error.message);
    }
}

// Reset form
function resetForm() {
    studentForm.reset();
    editingStudentId = null;

    document.getElementById("formTitle").textContent = "Add New Student";
    document.getElementById("submitBtn").textContent = "＋ Add Student";
}

// Update dashboard statistics
function updateStatistics() {
    document.getElementById("totalStudents").textContent = students.length;

    const departments = new Set(
        students.map(student => student.department)
    );

    document.getElementById("totalDepartments").textContent =
        departments.size;
}

// SEARCH - Filter student records
searchInput.addEventListener("input", function() {
    const searchValue = this.value.toLowerCase().trim();

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchValue) ||
        student.registerNumber.toLowerCase().includes(searchValue) ||
        student.department.toLowerCase().includes(searchValue)
    );

    displayStudents(filteredStudents);
});

// Clear button
document.getElementById("resetBtn").addEventListener("click", resetForm);

// Load records when page opens
fetchStudents();
