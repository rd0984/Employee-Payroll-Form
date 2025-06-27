
// json-server --watch db.json --port 3002

// whenever restart run the above command in terminal and then open dashboard.html 









$(document).ready(function () {
  const apiUrl = "http://localhost:3002/employee";
  let editId = localStorage.getItem("editId");

  // ✅ Prefill form if editing
  if (editId !== null) {
    $.get(`${apiUrl}/${editId}`)
      .done(function (emp) {
        $('.input1').val(emp.name);
        $(`input[name='profile'][value='${emp.profile}']`).prop("checked", true);
        $(`input[name='gender'][value='${emp.gender.toLowerCase()}']`).prop("checked", true);

        $(".label4-- input").each(function () {
          if (emp.department.includes($(this).val())) {
            $(this).prop("checked", true);
          }
        });

        $('.salary-select').val(emp.salary);

        const [date, month, year] = emp.startdate.split(" ");
        $('.date-input').eq(0).val(date);
        $('.date-input').eq(1).find("option").filter(function () {
          return $(this).text() === month;
        }).prop("selected", true);
        $('.date-input').eq(2).val(year);

        $('.notes-box').val(emp.notes);
      })
      .fail(function () {
        localStorage.removeItem("editId");
        editId = null;
      });
  }

  // ✅ Form validation
  function validateForm() {
    let isValid = true;

    const name = $('.input1').val().trim();
    const namePattern = /^[A-Z][a-zA-Z\s]{2,}$/;
    if (!namePattern.test(name)) {
      alert("Enter a valid name (start with capital, min 3 letters)");
      isValid = false;
    }

    if (!$("input[name='profile']:checked").val()) {
      alert("Please select a profile image.");
      isValid = false;
    }

    if (!$("input[name='gender']:checked").val()) {
      alert("Please select gender.");
      isValid = false;
    }

    if ($(".label4-- input:checked").length === 0) {
      alert("Select at least one department.");
      isValid = false;
    }

    if (!$('.salary-select').val()) {
      alert("Select a salary.");
      isValid = false;
    }

    const date = $('.date-input').eq(0).val();
    const month = $('.date-input').eq(1).val();
    const year = $('.date-input').eq(2).val();
    if (!date || !month || !year) {
      alert("Please complete the start date.");
      isValid = false;
    }

    return isValid;
  }

  // ✅ Submit form
  $('#form').submit(function (e) {
    e.preventDefault();
    if (!validateForm()) return;

    const name = $('.input1').val();
    const profile = $("input[name='profile']:checked").val();
    const gender = $("input[name='gender']:checked").val();
    const departments = [];
    $(".label4-- input:checked").each(function () {
      departments.push($(this).val());
    });

    const salary = $('.salary-select').val();
    const date = $('.date-input').eq(0).val();
    const monthText = $('.date-input').eq(1).find("option:selected").text();
    const year = $('.date-input').eq(2).val();
    const startdate = `${date} ${monthText} ${year}`;
    const notes = $('.notes-box').val();

    const employeeData = {
      ...(editId ? { id: Number(editId) } : {}),
      name,
      profile,
      gender: gender.charAt(0).toUpperCase() + gender.slice(1),
      department: departments,
      salary,
      startdate,
      notes
    };

    if (editId !== null) {
      // PUT (update)
      $.ajax({
        url: `${apiUrl}/${editId}`,
        type: "PUT",
        data: JSON.stringify(employeeData),
        contentType: "application/json",
        success: function () {
          localStorage.removeItem("editId");
          window.location.href = "dashboard.html";
        },
        error: function () {
          // fallback to POST if record not found
          $.ajax({
            url: apiUrl,
            type: "POST",
            data: JSON.stringify(employeeData),
            contentType: "application/json",
            success: function () {
              localStorage.removeItem("editId");
              window.location.href = "dashboard.html";
            }
          });
        }
      });
    } else {
      // POST (new entry)
      $.ajax({
        url: apiUrl,
        type: "POST",
        data: JSON.stringify(employeeData),
        contentType: "application/json",
        success: function () {
          localStorage.removeItem("editId");
          window.location.href = "dashboard.html";
        }
      });
    }
  });

  // ❌ Cancel button
  $('.cancel').on('click', function () {
    localStorage.removeItem("editId");
    window.location.href = "dashboard.html";
  });
});
